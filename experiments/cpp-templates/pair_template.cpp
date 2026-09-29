#include <iostream>

template <typename T1, typename T2>
class Pair {
  T1 value1;
  T2 value2;

 public:
  Pair(T1 v1, T2 v2) : value1(v1), value2(v2) {}

  void print() {
    std::cout << "<" << value1 << ", " << value2 << ">" << std::endl;
  }
};

int main() {
  Pair<int, std::string> p1(1, "hello");
  p1.print();

  Pair<float, long> p2(3.14, 1000000);
  p2.print();

  Pair<char, double> p3('a', 3.14);
  p3.print();

  Pair<bool, int> p4(true, 10);
  p4.print();

  Pair<std::string, std::string> p5("first", "second");
  p5.print();
  return 0;
}