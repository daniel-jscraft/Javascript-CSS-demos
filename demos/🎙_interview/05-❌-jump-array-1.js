/*
You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.

Return true if you can reach the last index, or false otherwise.

Example 1:

Input: nums = [2,3,1,1,4]
Output: true
Explanation: Jump 1 step from index 0 to 1, then 3 steps to the last index.
Example 2:

Input: nums = [3,2,1,0,4]
Output: false
Explanation: You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.
*/

// [2,3,1,1,4]

// 5 < 2

// [3,2,1,0,4]

// [2,3,1,0,4]

// [3,2,1,1,0,1]


let input = [2,3,1,1,4]
let index = 0
let currentIndex = 0

while((currentIndex + input[currentIndex]) <= input.length) {
    let max = 0
    maxJumpLength = input[currentIndex]
    console.log('maxJumpLength = ' + maxJumpLength)
    for (let i = currentIndex + 1; i <= maxJumpLength ; i++) {
        if (max < input[i]) {
            console.log(`MAX = ${input[i]}, I = ${i}`)
            max = input[i]
            currentIndex = i
        }
    }
    console.log(currentIndex)
}
   





