---
title: "딥러닝 스터디 — Cost Function과 Activation Function"
category: study
date: "2026-07-16"
order: 4
excerpt: "MSE·MAE·Cross Entropy 등 손실 함수와 Sigmoid·ReLU·GELU 등 활성화 함수를 정리하고, Loss와 Cost의 차이·Gradient Descent가 필요한 이유까지 짚어봅니다."
---

## Cost Function 비용 함수

데이터의 실제값과 예측값 사이의 오차를 줄이기 위한 함수. Cost Function이 없으면 모델이 더 나은 방향으로 학습을 진행할 수 없다.

- **MSE (Mean Squared Error)** — 오차값에 제곱을 더해 오차를 더 크게 벌리도록 만든다. 회귀 문제에서 많이 사용된다.
- **MAE (Mean Absolute Error)** — 오차를 절대값으로 계산해 이상치에 덜 민감하고 직관적이다.
- **Binary Cross Entropy** — 이진 분류에서 많이 사용되고, 오차에 더 큰 패널티를 주는 형식이다.
- **Cross Entropy** — 다중 클래스 분류에서 많이 사용하고, YOLO·ResNet·CNN 같은 모델에서 자주 쓰인다.

```
Cost Function과 Loss Function 차이
-> Loss는 데이터 1개의 오차이고, Cost는 전체 데이터 평균 오차를 의미한다.

Gradient Descent가 필요한 이유
-> Cost(오차)를 최대한 줄이기 위함. Gradient(기울기)가 0에 가까워지는 최소 지점을 찾기 위함.
```

## Activation Function 활성화 함수

신경망이 비선형적인 복잡한 패턴을 학습할 수 있도록 해주는 함수.

- **Sigmoid** — 0~1 사이 값으로 나타나 확률처럼 해석 가능해 이진 분류 출력층에서 많이 사용한다. 다만 깊은 신경망에서는 Gradient Vanishing(기울기 소실)이 발생하기 쉬워 잘 쓰지 않는다.
- **Gradient Vanishing (기울기 소실)이란?** — 역전파 과정에서 층을 거치며 기울기가 계속 곱해져 0에 가까워지는 현상. 앞쪽 층의 가중치가 거의 업데이트되지 않아 학습이 멈춘 것처럼 보인다.
- **Tanh** — 평균이 0이라 Sigmoid보다 학습이 안정적이지만, 역시 기울기 소실이 발생한다.
- **ReLU** — 기울기 소실을 해결하기 위해 나온 함수이며 계산이 빠르다. f(x) = max(0, x). 대부분 CNN과 YOLO에서 사용한다.
- **Dead ReLU란?** — 입력이 음수 구간에 머물러 뉴런이 계속 0만 출력하는 경우. 해당 뉴런은 더 이상 학습에 기여하지 못하고 죽은 상태가 된다.
- **Leaky ReLU** — ReLU의 단점을 개선해 음수에도 아주 작은 기울기를 유지한다. Dead ReLU 문제를 완화해 객체 탐지에 많이 사용된다.
- **GELU (Gaussian Error Linear Unit)** — 최근 Transformer 계열에서 가장 많이 사용하는 함수이며 성능이 우수하다. BERT, ViT, Transformer 계열에서 많이 사용된다.
- **Softmax** — 다중 분류에서 사용하는 활성화 함수. 각 클래스의 확률로 변환하며 총합은 항상 1이다. 객체 분류, 다중 클래스 분류에서 많이 사용한다.

객체 탐지 모델도 내부적으로는 이런 활성화 함수를 그대로 쓴다. YOLO 계열은 백본에 ReLU 계열(Leaky ReLU, SiLU 등)을 주로 사용하고, Transformer 기반 탐지 모델은 GELU를 사용하는 식으로 모델 구조에 맞는 활성화 함수가 선택된다.
