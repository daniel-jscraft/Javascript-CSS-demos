/*
Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

Example 1:

Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
Example 2:

Input: nums = [3,2,4], target = 6
Output: [1,2]
Example 3:

Input: nums = [3,3], target = 6
Output: [0,1]
*/

let nums = [3, 3, 2, 4]
let target = 6
let map = {}

nums.forEach( 
    (v,i) => v in map ? map[v].push(i) : map[v] = [i]
)

console.log(nums)
console.log(map)
for( i in map) {
    let workingMap = map
    if (target - i in map) {
        let pos1 = workingMap[i].pop()
        let pos2 = workingMap[target - i].pop()
        if (typeof pos1 !== "undefined" && typeof pos2 !== "undefined") 
            console.log(`SOL = nums[${pos1}] + nums[${pos2}]`)
    }
}


