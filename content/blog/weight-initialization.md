---
title: "딥러닝 스터디 — Weight Initialization"
category: study
date: "2026-07-19"
order: -2
excerpt: "가중치를 어떻게 초기화하느냐에 따라 학습이 시작되기도 전에 activation이 사라지거나 폭발할 수 있다는 것을, Xavier·He 초기화를 직접 비교한 실험으로 확인하고 정리합니다."
---

## 왜 가중치 초기화가 중요한가

모델을 학습시키기 전, 파라미터 몇십만~몇억 개를 어떤 값으로 채우느냐가 첫 forward pass 결과부터 이미 갈린다. 대표적으로 실패하는 두 극단이 있다.

- **모두 0으로 초기화**: 같은 레이어의 뉴런들이 같은 입력에 대해 완전히 같은 출력과 같은 gradient를 받는다. 아무리 학습을 반복해도 뉴런들이 서로 다른 특징을 학습하지 못하고 계속 똑같이 움직인다(대칭성이 깨지지 않는 문제).
- **무작정 크거나 작은 무작위 값**: 레이어를 하나씩 통과할 때마다 activation의 분산이 계속 곱해지면서, 몇 개 레이어만 지나도 값이 0으로 수렴하거나(vanishing) 반대로 발산한다(exploding). 학습이 시작되기도 전에 신호 자체가 사라지거나 터진다.

## Xavier와 He, 뭐가 다른가

- **Xavier(Glorot) Initialization** — sigmoid·tanh처럼 원점 근처에서 선형에 가까운 활성화 함수를 가정하고, 입력 노드 수(fan_in)와 출력 노드 수(fan_out)를 모두 고려해 분산을 `1/fan_in`(또는 `2/(fan_in+fan_out)`) 수준으로 맞춘 초기화.
- **He(Kaiming) Initialization** — ReLU는 음수 입력을 전부 0으로 만들어버려서 출력의 분산이 대략 절반으로 줄어드는데, Xavier는 이걸 고려하지 않는다. He 초기화는 분산을 `2/fan_in`으로 잡아서 ReLU가 깎아먹는 절반을 미리 보정해둔다.
- **LeCun Initialization** — 분산을 `1/fan_in`으로 잡는 방식으로, SELU처럼 자체적으로 activation을 정규화하는 함수와 함께 쓰인다.
- **Zero/상수 Initialization** — 위에서 말한 대칭성 문제 때문에 실무에서는 쓰지 않는다.

## 실제로 레이어를 통과시켜서 비교해봤다

이론으로만 알고 넘어가기엔 찜찜해서, 완전연결 레이어 10개를 통과시키면서 activation의 표준편차가 어떻게 변하는지 직접 확인해봤다. 활성화 함수는 ReLU로 고정하고, 초기화 방식만 바꿔가며 같은 실험을 반복했다.

```python
import numpy as np

np.random.seed(0)

def relu(x):
    return np.maximum(0, x)

def run(std_fn, num_layers=10, layer_size=512, batch=1000):
    x = np.random.randn(batch, layer_size)
    stds = [x.std()]
    for i in range(num_layers):
        fan_in = layer_size
        std = std_fn(fan_in)
        w = np.random.randn(layer_size, layer_size) * std
        x = relu(x @ w)
        stds.append(x.std())
    return stds

fixed_small = run(lambda fan_in: 0.01)
xavier = run(lambda fan_in: np.sqrt(1.0 / fan_in))
he = run(lambda fan_in: np.sqrt(2.0 / fan_in))
```

10개 레이어를 통과한 뒤 activation의 표준편차를 레이어별로 찍어보면 이렇다(입력 표준편차는 1로 시작).

- **고정값 0.01**: 1.00 → 0.13 → 0.02 → 0.003 → 0.0006 → 0.0001 → 이후 사실상 0 — 레이어 6~7을 넘기기도 전에 신호가 완전히 죽는다.
- **Xavier(√(1/fan_in))**: 1.00 → 0.58 → 0.41 → 0.28 → 0.20 → 0.14 → ... → 0.023 — 죽지는 않지만 레이어를 지날 때마다 꾸준히 줄어든다.
- **He(√(2/fan_in))**: 1.00 → 0.83 → 0.85 → 0.82 → 0.83 → 0.87 → ... → 0.92 — 10개 레이어를 통과해도 거의 그대로 유지된다.

Xavier도 무작정 작은 값(0.01)보다는 훨씬 낫지만, ReLU 앞에서는 여전히 서서히 죽는다. 분산 계산에 ReLU가 절반을 깎아낸다는 사실이 빠져 있기 때문이다. He 초기화가 정확히 이 지점을 계산에 넣어서, ReLU를 쓰는 네트워크에서 레이어가 깊어져도 신호가 유지되도록 만든다.

## 이 결과가 실전에서 중요한 이유

이 실험은 forward pass 얘기지만, 진짜 문제는 backward에서 터진다. forward에서 activation이 레이어를 지날 때마다 줄어들면, backward에서 gradient도 체인룰을 타고 똑같이 줄어든다. 그러면 입력에 가까운 앞쪽 레이어들은 gradient를 거의 못 받아서 사실상 학습이 멈춘다 — vanishing gradient 문제다. 레이어가 10개일 때는 버틸 만해도, 50개·100개로 깊어지면 이 감쇠가 누적되어 훨씬 치명적이다.

더 실무적인 문제는 원인을 찾기 어렵다는 점이다. 학습이 잘 안 되면 보통 러닝레이트나 데이터, 모델 구조부터 의심하게 되는데, 위 실험처럼 레이어 6~7만 지나도 activation이 0.0으로 죽어있다면 그 뒤로 무엇을 바꿔도 의미 있는 신호가 없다. 초기화 시점에 이미 죽은 네트워크를 붙잡고 학습률을 조정하고 있었던 셈이다.

그래서 나온 실무 규칙이 "활성화 함수를 바꾸면 초기화도 같이 바꿔야 한다"는 것이다. ReLU를 쓰면서 Xavier를 그대로 쓰거나, 반대로 tanh를 쓰면서 He를 쓰면 이론적으로 맞지 않는 조합이 되고, 위 실험이 그 차이를 실제 숫자로 보여준다.

## 실무에서는 프레임워크가 이미 처리해준다

PyTorch의 `nn.Linear`, `nn.Conv2d` 같은 레이어는 기본값으로 이미 fan_in 기반 초기화가 들어가 있다. 다만 활성화 함수를 ReLU 계열로 쓴다면 `kaiming_normal_`/`kaiming_uniform_`으로 명시적으로 맞춰주는 게 안전하고, sigmoid·tanh를 쓴다면 `xavier_normal_`/`xavier_uniform_`이 더 맞는다.

Batch Normalization이나 Layer Normalization을 쓰면 레이어마다 분포를 다시 정규화해주기 때문에 초기화에 대한 민감도가 크게 줄어든다. 그렇다고 초기화를 아무렇게나 해도 된다는 뜻은 아니다 — 정규화 레이어가 자리 잡기 전인 학습 초반 몇 스텝은 여전히 초기화 값의 영향을 그대로 받는다.

## 정리

- 가중치를 0으로 초기화하면 뉴런 간 대칭성이 깨지지 않아 학습이 안 되고, 무작정 작거나 크게 초기화하면 레이어를 거치며 activation이 소실되거나 발산한다.
- Xavier는 sigmoid·tanh처럼 선형에 가까운 활성화 함수를, He는 ReLU처럼 절반을 0으로 깎는 활성화 함수를 가정하고 설계됐다 — 활성화 함수에 맞지 않는 초기화를 쓰면 이론적으로 어긋난다.
- 직접 10개 레이어를 통과시켜본 결과, 작은 고정값은 레이어 6~7에서 신호가 완전히 죽었고 Xavier는 서서히 줄었으며 He만 끝까지 분산을 유지했다 — ReLU 환경에서는 이 차이가 실제로 크다.
- forward에서 activation이 죽으면 backward에서 gradient도 체인룰을 타고 똑같이 줄어든다 — 초기화 문제가 곧 vanishing gradient 문제로 이어지고, 레이어가 깊을수록 더 치명적이다.
- 학습이 안 될 때 러닝레이트나 데이터부터 의심하기 쉽지만, 초기화 시점에 이미 신호가 죽어있는 경우도 있다는 걸 염두에 둘 필요가 있다.
- 프레임워크 기본 초기화를 무조건 믿기보다, 쓰고 있는 활성화 함수와 초기화 방식이 실제로 맞는 조합인지 한 번은 확인해볼 필요가 있다.
