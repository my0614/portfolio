---
title: "ROS에서 RGB-Depth 프레임 매칭과 픽셀 → 실거리 변환 구현하기"
category: vision
date: "2026-07-16"
order: 1
excerpt: "드론 RGB-D 카메라에서 RGB·Depth 프레임을 동적 slop으로 동기화하고, 픽셀 좌표를 핀홀 카메라 모델로 실거리·드론 좌표계로 변환하는 과정과 검증 과정에서 짚어본 의문점을 코드와 함께 정리합니다."
---

## 카메라가 본 객체를 드론의 3D 좌표로 바꿔야 했다

드론에 달린 RGB-D 카메라(RealSense 계열)로 사람·화재·부상자 같은 객체를 탐지하는 프로젝트였다. 탐지 자체는 RGB 이미지 한 장이면 되지만, 그 객체가 드론으로부터 "어느 방향으로 몇 미터 떨어져 있는지"를 구하려면 같은 순간의 Depth 이미지가 같이 필요하다. 이게 세 가지 문제로 나뉜다.

1. RGB 프레임과 Depth 프레임을 정확히 짝지어야 한다 (프레임 매칭)
2. 짝지은 프레임에서 탐지된 픽셀 좌표의 depth 값을 실제 거리(미터)로 바꿔야 한다
3. 카메라 기준 좌표를 드론 기준 좌표로 변환해야 한다

## ApproximateTimeSynchronizer로 프레임 매칭하기

RGB와 Depth는 서로 다른 토픽으로, 서로 다른 타이밍에 들어온다. 정확히 같은 타임스탬프를 가진 쌍이 오는 게 아니라서 ROS의 message_filters.ApproximateTimeSynchronizer로 "타임스탬프가 어느 정도 가까운" 메시지끼리 묶었다.

```python
self.rgb_sub = message_filters.Subscriber(config['topics']['rgb_image'], CompressedImage, queue_size=1)
self.depth_sub = message_filters.Subscriber(config['topics']['depth_image'], Image, queue_size=1)

self.ts = message_filters.ApproximateTimeSynchronizer(
    [self.rgb_sub, self.depth_sub],
    queue_size=10,
    slop=self.current_slop
)
self.ts.registerCallback(self.image_callback)
```

"slop"은 두 메시지의 타임스탬프 차이를 얼마까지 "같은 프레임"으로 봐줄지 정하는 허용 오차(초)다. 코드에는 이 값을 고정하지 않고, 최근 수신 간격을 관찰해서 주기적으로 재조정하는 로직이 별도로 붙어 있다.

```python
# 동적 slop 조정을 위한 변수들
if mode == "DEPTH":
    self.depth_timestamps = []
    self.slop_update_interval = 3
    self.current_slop = 0.6
```

```python
def monitor_depth_quality(self):
    """Depth 데이터 품질 모니터링 및 동적 slop 조정 (개선 버전)"""
    while not self.shutdown_flag:
        time.sleep(self.slop_update_interval)
        if len(self.depth_timestamps) >= 3:
            intervals = []
            for i in range(1, len(self.depth_timestamps)):
                intervals.append(self.depth_timestamps[i] - self.depth_timestamps[i-1])

            if intervals:
                avg_interval = sum(intervals) / len(intervals)
                new_slop = max(0.5, min(2.0, avg_interval * 2))

                if abs(new_slop - self.current_slop) > 0.15:
                    logger.info("Updating synchronizer slop: %.2f -> %.2f (avg interval: %.2f)",
                              self.current_slop, new_slop, avg_interval)
                    self.update_synchronizer(new_slop)
```

동작 방식은 이렇다.

- image_callback(동기화 성공 콜백)이 호출될 때마다 현재 시각을 depth_timestamps에 기록하고, 최근 10개만 유지한다.
- 별도 스레드(monitor_depth_quality)가 3초(slop_update_interval)마다 최근 수신 간격의 평균(avg_interval)을 계산한다.
- 새 slop 후보를 avg_interval * 2로 잡고, [0.5, 2.0] 초 범위로 클램프한다.
- 기존 slop과 0.15초 이상 차이가 나야 실제로 update_synchronizer()를 호출해 synchronizer를 새로 만든다(너무 자주 재생성하지 않도록 하는 히스테리시스).

slop을 고정값으로 두면 두 가지 실패 모드가 생긴다. 너무 작으면 네트워크가 불안정할 때 동기화된 쌍이 거의 안 잡히고(탐지 결과가 끊김), 너무 크면 실제로는 다른 순간의 RGB와 Depth를 같은 프레임으로 착각해 depth 값이 어긋난다. 이 코드는 그 사이 값을 매번 고정으로 정하는 대신, 실제 수신 간격에 맞춰 자동으로 좁히거나 넓히는 방식을 택했다.

RGB 전용 모드에서는 이 동기화 없이 rgb_sub.registerCallback(self.rgb_callback)으로 단순 구독만 한다 — 거리 계산이 필요 없는 모드이기 때문이다.

## 픽셀 좌표 → 실제 거리(m)

탐지된 객체의 바운딩 박스 중심 픽셀(ori_x, ori_y)을 depth 이미지에서 그대로 인덱싱하면 밀리미터 단위 정수값이 나온다.

```python
# Depth 거리값 미터 변환
def point_distance(self, x, y, rgb_image, depth_image):
    rgb_image = cv2.circle(rgb_image, (x,y), 2, (0, 0, 255), -1)
    distance = depth_image[y,x]
    distance = distance / 1000.0  # Meter
    return distance, rgb_image
```

RealSense 계열 depth 이미지가 보통 16비트 정수, 단위가 밀리미터라서 / 1000.0으로 미터 단위로 바꾼다. depth_image[y, x]처럼 인덱싱 순서가 (행, 열) = (y, x)인 것도 실수하기 쉬운 부분이라 짚어둘 만하다.

## 검증하며 짚어본 두 가지 의문

point_distance()가 돌려주는 값을 곧바로 다음 단계(핀홀 역투영)에 넘기기엔 찜찜한 지점이 두 가지 있었다. 좌표 변환 전체가 이 한 줄의 depth 값 위에 쌓이는 구조라, 여기서 잘못된 전제를 깔고 가면 뒤에 나오는 3D 좌표·드론 좌표 변환까지 통째로 틀어지기 때문에 넘어가지 않고 짚었다.

- **평면을 촬영했을 때 화면 왼쪽·중앙·오른쪽 픽셀의 depth 값이 일정한가?** — 카메라와 정확히 마주보는 평면(벽 등)을 두고 depth_image의 여러 열(column)을 직접 비교해봤다. 화면 가장자리 픽셀은 카메라 렌즈에서 대각선 방향으로 더 먼 실제 거리에 있지만, depth 센서가 돌려주는 값은 직선(radial) 거리가 아니라 광축(z축) 기준 수직 거리이기 때문에 평면이 카메라와 평행하면 좌·중앙·우 픽셀 값이 거의 같아야 한다는 전제를 세우고 이를 검증했다. 이 전제를 그냥 넘겼다면 depth_image[y, x]를 "그 지점까지의 직선 거리"로 착각한 채 이후 모든 좌표 계산이 틀어졌을 것이다.
- **탐지된 객체 중심 픽셀의 변환값이 줄자로 잰 실측값과 같은가?** — point_distance()는 depth 센서 원시값을 단위만 바꾼 값이라, 센서 캘리브레이션이나 RGB-Depth 정렬(align) 오차가 있으면 그대로 실려 나온다. 계산값과 실측값을 나란히 놓고 비교해야 point_distance()를 좌표 계산에 그대로 믿고 써도 되는 값인지, 별도 보정이 필요한 값인지 판단할 수 있다.

![평면 촬영 시 depth 값 비교](/blog/ros-rgb-depth-frame-matching/depth_거리.png)

두 질문 모두 결국 같은 지점을 겨냥한다. depth 값을 좌표 계산에 그대로 넣기 전에, 센서가 실제로 돌려주는 값이 어떤 기준(수직 거리인지 직선 거리인지)이고 얼마나 오차가 있는지를 검증 없이는 믿지 않는 태도가 필요하다는 것이다.

## 카메라 좌표 → 드론 좌표 변환 (핀홀 카메라 모델)

거리(depth)만으로는 부족하고, 카메라의 내부 파라미터(intrinsics)를 알아야 픽셀 위치를 3D 공간 좌표로 되돌릴 수 있다. intrinsics는 카메라 정보 토픽에서 한 번만 받아온다.

```python
# Camera Info (intricsic)
def imageDepthInfoCallback(self, cameraInfo):
    self.intrinsics_cx = cameraInfo.K[2]
    self.intrinsics_cy = cameraInfo.K[5]
    self.intrinsics_fx = cameraInfo.K[0]
    self.intrinsics_fy = cameraInfo.K[4]
    self.sub_info.unregister()
```

CameraInfo.K는 3x3 intrinsic 행렬을 1차원으로 펼친 값이라, K[0]이 fx, K[4]가 fy, K[2]가 cx, K[5]가 cy에 해당한다. 콜백 마지막에 self.sub_info.unregister()로 구독을 끊는 것도 눈에 띈다 — intrinsics는 카메라가 고정된 이상 한 번만 받으면 되는 값이라, 매 프레임 다시 구독할 필요가 없어서 처음 값을 받은 직후 구독을 해제한다.

이 intrinsics로 픽셀 좌표(rgb_x, rgb_y)와 거리(distance)를 카메라 기준 3D 좌표로 역투영한다.

```python
def drone_points(self, distance, rgb_x, rgb_y):
    # 3D Point from pixel
    x = (rgb_x - self.intrinsics_cx) * distance / self.intrinsics_fx
    y = (rgb_y - self.intrinsics_cy) * distance / self.intrinsics_fy

    dr_x = distance
    dr_y = -x
    dr_z = -y
    return dr_x, dr_y, dr_z
```

x = (rgb_x - cx) * distance / fx, y = (rgb_y - cy) * distance / fy는 표준 핀홀 카메라 역투영 공식이다. 여기까지는 카메라 기준 좌표(x: 오른쪽, y: 아래쪽, z: 정면 = distance)다.

마지막 줄에서 카메라 좌표를 드론 기준 좌표로 축을 다시 매핑하는데, 이건 README에 명시된 규칙과 일치한다.

> 드론 x ← 카메라 z\
> 드론 y ← 카메라 -x\
> 드론 z ← 카메라 -y

코드의 dr_x = distance(카메라 z), dr_y = -x, dr_z = -y가 정확히 이 매핑대로다. 카메라는 "정면이 z, 오른쪽이 x, 아래가 y"인 좌표계를 쓰고 드론은 "전방이 x, 왼쪽이 y, 위가 z"인 좌표계를 쓰기 때문에, 축을 재배치하고 부호를 뒤집어야 두 좌표계가 맞는다.

## 정리

- 서로 다른 주기로 들어오는 두 센서 토픽을 짝지을 때는 ApproximateTimeSynchronizer의 slop을 고정하지 않고, 실측 수신 간격 기반으로 동적으로 조정하는 방식을 쓸 수 있다.
- Depth 이미지는 보통 밀리미터 단위 정수이므로 실거리(m) 변환 시 단위 스케일과 (y, x) 인덱싱 순서를 먼저 확인해야 한다.
- depth 센서 값을 좌표 계산에 쓰기 전에, 그 값이 직선 거리인지 광축 기준 수직 거리인지, 평면 촬영 시 화면 위치별로 값이 일정한지, 실측값과 얼마나 차이 나는지를 먼저 검증하는 게 안전하다.
- 픽셀 좌표를 3D 좌표로 되돌리려면 카메라 intrinsics(fx, fy, cx, cy)가 필요하고, 이건 카메라가 고정이면 최초 1회만 받아도 충분하다.
- 카메라 좌표계와 목표 좌표계(여기서는 드론)가 다르면 축 재배치 + 부호 반전으로 변환해야 하고, 이 매핑 규칙은 코드 주석이 아니라 문서(README)에도 명시해두는 편이 나중에 헷갈리지 않는다.
