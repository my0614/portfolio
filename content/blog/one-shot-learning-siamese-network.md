---
title: "Zero-shot, One-shot, Few-shot으로 문제를 나눴다"
category: study
date: "2026-07-18"
order: -1
excerpt: "클래스당 예시를 몇 개 확보할 수 있는가로 문제를 나누고, Siamese Network와 에피소드 학습으로 '분류' 대신 '비교'를 학습하는 방식을 코드와 함께 정리합니다."
---

## "데이터를 더 모아라"가 통하지 않는 지점들

분류 모델을 만들 때 가장 먼저 배우는 원칙은 "클래스당 데이터를 최대한 많이 모아라"다. 고양이/개 분류기를 만들면 클래스당 수백~수천 장을 모으고, 그걸로 CNN을 학습시킨다. 이 방식은 클래스 수가 고정돼 있고, 각 클래스마다 데이터를 계속 모을 수 있을 때는 잘 작동한다.

그런데 이 전제가 깨지는 지점들이 있다.

- **얼굴 인식 출입 시스템**: 새 직원이 등록될 때마다 그 사람 얼굴 사진을 수백 장씩 모을 수 없다. 등록 사진은 보통 1장, 많아야 몇 장이다.
- **희귀 질환 이미지 진단**: 특정 희귀 질환은 애초에 전 세계에 확진 사례 자체가 몇십 건뿐이라, "클래스당 수천 장"이라는 전제가 물리적으로 성립하지 않는다.
- **신규 클래스가 계속 추가되는 서비스**: 이커머스 상품 인식처럼 매일 새로운 상품(클래스)이 추가되는 시스템은, 새 클래스가 생길 때마다 모델을 처음부터 재학습시킬 여유가 없다.

즉 "클래스당 데이터를 얼마나 확보할 수 있는가"라는 축 자체가 도메인마다 다른데, 모든 문제를 "데이터를 더 모아서 재학습"으로 밀어붙이면 어떤 도메인은 애초에 시작조차 못 한다. 이 축을 명시적으로 나눈 게 zero-shot, one-shot, few-shot이라는 문제 설정이다.

## "분류"가 아니라 "비교"를 학습한다

전통적인 분류기는 "이 이미지는 N개 클래스 중 어디에 속하는가"를 직접 출력하도록 학습된다. 클래스가 추가되면 출력층부터 다시 손봐야 한다. one-shot learning은 이 구조 자체를 바꾼다. 모델이 배우는 건 "정답 클래스가 무엇인가"가 아니라 "두 입력이 같은 클래스인가"라는 비교 함수다.

가장 널리 쓰이는 구조가 Siamese Network다. 두 입력을 같은 인코더에 통과시켜 임베딩을 뽑고, 그 거리로 같은 클래스인지 판단한다.

```python
# siamese_network.py
import torch
import torch.nn as nn
import torch.nn.functional as F

class Encoder(nn.Module):
    """두 입력이 공유하는 인코더. 가중치를 공유한다는 게 핵심."""
    def __init__(self, embedding_dim: int = 128):
        super().__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 64, 10), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 7), nn.ReLU(), nn.MaxPool2d(2),
        )
        self.fc = nn.Linear(128 * 20 * 20, embedding_dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv(x)
        x = x.flatten(1)
        return self.fc(x)


def one_shot_predict(encoder: Encoder, support_image, support_label, query_image) -> str:
    """
    support_image: 새로 등록된 클래스의 예시 '단 1장'
    query_image: 이게 support_image와 같은 클래스인지 판단할 대상
    """
    with torch.no_grad():
        support_emb = encoder(support_image.unsqueeze(0))
        query_emb = encoder(query_image.unsqueeze(0))
        distance = F.pairwise_distance(support_emb, query_emb)

    THRESHOLD = 0.5
    return support_label if distance.item() < THRESHOLD else "unknown"
```

Encoder는 미리 대량의 데이터(다른 클래스들)로 "비슷한 것과 다른 것을 구별하는 임베딩 공간"을 학습해둔다. 이 학습이 끝나면, one_shot_predict처럼 새 클래스는 재학습 없이 support_image 딱 1장만 넣어도 인식이 가능하다. 원본 모델(Encoder)을 다시 건드리지 않고, 등록 단계에서는 임베딩 하나만 계산해서 비교하는 셈이다.

## zero-shot, one-shot, few-shot으로 나누기

"새 클래스에 예시가 몇 개 주어지는가"라는 축을 따라 문제 자체가 갈라진다. Siamese Network 같은 구조는 공통으로 쓰지만, support set의 크기에 따라 이름과 난이도가 달라진다.

| 설정 | support set 크기 | 판단 방식 | 예시 |
|---|---|---|---|
| Zero-shot | 0장 (텍스트 설명만) | 클래스 설명(속성, 임베딩)과 입력을 비교 | "줄무늬가 있고 말과 비슷하게 생긴 동물" 설명만으로 얼룩말 이미지 판별 |
| One-shot | 1장 | support 1개와의 거리 비교 | 직원 얼굴 사진 1장 등록 후 출입 인식 |
| Few-shot | 2~수십 장 | support set 평균(prototype)과 거리 비교 | 신규 상품 사진 5장으로 카테고리 분류기 미세 조정 |
| 전통적 지도학습 | 수백~수천 장 | 클래스 경계를 직접 학습 | 고양이/개 분류기 |

표에서 보듯 zero-shot과 one-shot이 다른 것은 "지원 예시가 있냐 없냐" 하나다. one-shot은 support가 1개라 "그 하나와 얼마나 가까운가"로 판단이 끝나지만, zero-shot은 비교할 실제 예시가 없어서 클래스 설명(텍스트, 속성 벡터)이라는 대체재를 써야 한다. few-shot은 support가 여러 개라, 그 여러 개의 평균(prototype)을 계산해서 비교하는 Prototypical Network 같은 구조가 추가로 필요해진다.

## 에피소드 학습으로 비교 함수 학습시키기

Siamese Network 자체는 "비교 함수"일 뿐이고, 이 비교 함수를 실제로 학습시키는 방식이 또 하나의 계층이다. 여기서 쓰이는 게 에피소드 학습(episodic training), 흔히 메타러닝(meta-learning)이라 부르는 방식이다.

```python
# episodic_training.py
def sample_episode(dataset, n_way: int = 5, k_shot: int = 1):
    """
    실제 테스트 상황(새 클래스, 예시 k개)을 학습 중에도 그대로 흉내 낸다.
    n_way: 이번 에피소드에서 구별할 클래스 수
    k_shot: 클래스당 support 예시 개수 (1이면 one-shot)
    """
    classes = random.sample(dataset.classes, n_way)
    support_set, query_set = [], []
    for c in classes:
        examples = random.sample(dataset.by_class[c], k_shot + 1)
        support_set.extend(examples[:k_shot])
        query_set.append(examples[k_shot])
    return support_set, query_set


def train_step(encoder, optimizer, dataset):
    support, query = sample_episode(dataset, n_way=5, k_shot=1)
    # support/query를 encoder에 통과시켜 거리를 계산하고,
    # query가 올바른 support와 가장 가깝도록 loss를 역전파한다
    ...
```

일반적인 학습은 "전체 데이터를 한 번에 보고 클래스 경계를 긋는" 방식이지만, 에피소드 학습은 학습 단계에서부터 "적은 예시로 새 클래스를 구별해야 하는 상황"을 계속 재현한다. n_way, k_shot을 조합해서 5-way-1-shot(클래스 5개, 예시 1개씩)처럼 실제 테스트 조건과 똑같은 미니 문제를 매 스텝 뽑아 학습시킨다. 그래야 실제 배포 시점에 처음 보는 클래스가 와도 "비교하는 법" 자체는 이미 훈련된 상태로 대응할 수 있다.

## 이 방식의 장단점

### 장점

- 새 클래스가 추가될 때 모델 재학습이 필요 없다. 등록 단계는 임베딩 계산 한 번으로 끝난다.
- 클래스당 데이터를 대량으로 모으기 어려운 도메인(희귀 질환, 신규 사용자 등록)에서도 시작이 가능하다.
- 인코더 하나가 여러 클래스에 재사용되므로, 클래스 수가 늘어나도 모델 크기가 커지지 않는다.

### 한계

- **인코더 학습에는 여전히 대량의 데이터가 필요하다.** one-shot은 "새 클래스 등록"에만 데이터가 적게 드는 것이지, "비교하는 법을 배우는" 사전 학습 단계는 오히려 다양한 클래스로 이루어진 대규모 데이터셋을 요구한다.
- **도메인 시프트에 취약하다.** 얼굴 이미지로 학습한 인코더의 임베딩 공간은 손글씨 문자에는 잘 안 맞는다. 사전 학습 도메인과 실제 적용 도메인이 다르면 "비교하는 법" 자체가 어긋난다.
- **임계값(threshold) 튜닝이 별도로 필요하다.** one_shot_predict의 THRESHOLD = 0.5처럼, 거리 기반 판단은 도메인마다 적절한 경계값을 따로 찾아야 하고, 이 값이 안 맞으면 오탐/미탐이 늘어난다.

## 문제 설정은 잘 나눴는데, "얼마나 비슷해야 같은 것인가"는 여전히 사람이 정한다

zero-shot, one-shot, few-shot으로 문제를 나누고 나면, 각 설정에 맞는 구조(Siamese, Prototypical, Matching Network)를 고르는 것까지는 비교적 명확해진다. 그런데 실제로 걸리는 지점은 그 다음이었다. 거리 기반 판단이든 텍스트 임베딩 유사도든, 결국 "이 정도 거리면 같은 클래스로 볼 것인가"라는 임계값은 모델이 스스로 정해주지 않는다.

얼굴 인식이라면 오탐(다른 사람을 같은 사람으로 인식)의 비용이 미탐(같은 사람을 못 알아봄)보다 훨씬 크기 때문에 임계값을 보수적으로 잡아야 하고, 희귀 질환 스크리닝이라면 반대로 미탐의 비용이 훨씬 커서 임계값을 느슨하게 잡아야 한다. 이 판단은 모델 구조나 학습 방식이 아니라, 그 시스템이 놓인 도메인의 리스크 구조에서 나온다.

여기서 얻은 관점은, one-shot learning이 풀어주는 건 "데이터가 적어도 새 클래스를 인식할 수 있는가"이지 "얼마나 비슷해야 같은 것으로 볼 것인가"까지 대신 정해주지는 않는다는 것이다. 문제 설정을 아무리 잘 나눠도, 그 위에서 내려야 하는 임계값·비용 함수 설계는 결국 도메인 지식이 있는 사람의 몫으로 남는다.

## 정리

- 문제를 하나로 뭉뚱그리지 말고 "클래스당 예시를 몇 개 확보할 수 있는가"라는 축으로 zero-shot / one-shot / few-shot / 전통적 지도학습을 나누면, 도메인에 맞는 구조를 고르기가 쉬워진다.
- one-shot learning의 핵심은 "분류"가 아니라 "비교"를 학습하는 것이다. Siamese Network처럼 가중치를 공유하는 인코더가 이 비교 함수 역할을 한다.
- 비교 함수 자체는 에피소드 학습(메타러닝)으로 사전 학습해두어야 하며, 이 사전 학습 단계에는 오히려 다양한 클래스의 대규모 데이터가 필요하다.
- one-shot이 줄여주는 건 "새 클래스 등록 비용"이지 "사전 학습 비용"이 아니다 — 두 비용을 헷갈리면 안 된다.
- 거리·유사도 기반 판단에는 임계값이 필요하고, 이 값은 도메인의 오탐/미탐 비용 구조에 따라 사람이 정해야 한다. 문제 설정을 잘 나눈 다음 과제는 그 위에 올릴 임계값과 비용 함수를 설계하는 것이다.
