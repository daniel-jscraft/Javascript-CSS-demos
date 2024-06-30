/*
Given an array nums of size n, return the majority element.

The majority element is the element that appears more than ⌊n / 2⌋ times. You may assume that the majority element always exists in the array.

Example 1:

Input: nums = [3,2,3]
Output: 3
Example 2:

Input: nums = [2,2,1,1,1,2,2]
Output: 2
*/

let input = [2,2,1,1,1,2,2]
let uniqueValues = []
let appearanceNo = []


for (let val of input) {
    let valIndex = uniqueValues.lastIndexOf(val)
    if( valIndex === -1) {
        uniqueValues.push(val)
        appearanceNo.push(0)
    }
    else 
        appearanceNo[valIndex] += 1
}

let maxAppearanceNo = 0
let maxAppearanceNoIndex = -1

appearanceNo.forEach( (v,i) => {
    if(v > maxAppearanceNo) {
        maxAppearanceNo = v
        maxAppearanceNoIndex = i
    }
})

console.log(uniqueValues)
console.log(appearanceNo)
console.log(`Majority Element = ${uniqueValues[maxAppearanceNoIndex]}`)


