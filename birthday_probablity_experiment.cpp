#include <math.h>
#include <stdio.h>
#include <stdlib.h>

#include <iostream>

void birthday(int n) {
  int c = 0;  // set our counter for how many experiments have a same birthday
  for (int j = 0; j < 700; j++) {  // this loop runs the experiment 100 times
    int array[n] = {};             // initialize an array of size n
    for (int i = 0; i < n;
         i++) {  // fill up the array with random numbers between 1-365
      array[i] = (rand() % 365);
    }
    int array_unique = 0;  // define a variable to tell us whether or not we
                           // have a unique array
    for (int k = 0; k < n;
         k++) {  // use two for loop to check for duplicates in the array
      for (int q = k + 1; q < n; q++) {
        if (array[k] == array[q]) {  // if the values are the same, set the
                                     // unique variable to one
          array_unique = 1;
        }
      }
    }
    if (array_unique == 1) {  // if this is set to one, add one to our counter,
                              // this experiment resulted in the same birthday
      c++;
    }
  }
  printf(" %d, %d, %f \n", n, c, c / 700.0);
}
int main() {
  for (int i = 5; i <= 100; i += 5) {
    birthday(i);
  }
  return 0;
}
