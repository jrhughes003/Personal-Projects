# Experiments

Small, self-contained programs.

| Project | Language | Description |
| --- | --- | --- |
| [`birthday-paradox/`](birthday-paradox/) | C++ | Monte Carlo check of the birthday paradox: 700 trials per group size from 5 to 100 people, printing the share of trials with a shared birthday. |
| [`cpp-templates/`](cpp-templates/) | C++ | A generic `Pair<T1, T2>` class template instantiated with several type combinations. |

## Building

```bash
g++ -o birthday_paradox birthday-paradox/birthday_paradox.cpp
./birthday_paradox

g++ -std=c++17 -o pair_template cpp-templates/pair_template.cpp
./pair_template
```
