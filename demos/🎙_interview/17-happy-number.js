/*
Write an algorithm to determine if a number n is happy.

A happy number is a number defined by the following process:

Starting with any positive integer, replace the number by the sum of the squares of its digits.
Repeat the process until the number equals 1 (where it will stay), or it loops endlessly in a cycle which does not include 1.
Those numbers for which this process ends in 1 are happy.
Return true if n is a happy number, and false if not.

 

Example 1:

Input: n = 19
Output: true
Explanation:
12 + 92 = 82
82 + 22 = 68
62 + 82 = 100
12 + 02 + 02 = 1
Example 2:

Input: n = 2
Output: false
*/

let getDigits = n => {
    let digits = []
    while (n > 0) {
        digits.push(n % 10)
        n = (n - (n % 10)) / 10
    }
    return digits
}

let stuckInALoop = v => {
    if (v.length % 2 === 1) return false
    for (let i = 0; i < v.length / 2; i++) 
        if (v[i] !== v[v.length / 2 + i]) return false
    return true && v.length
}

let n = 2
let pastValues = []

console.log(!stuckInALoop(pastValues))


while((n!=1) && (!stuckInALoop(pastValues))) {
    let digits = getDigits(n)
    let sum = 0
    for (d of digits)
        sum += d * d
    pastValues.push(n)
    n = sum
    console.log(n, pastValues)
    process.openStdin()
}

n === 1 ? console.log('🎉 Number is Happy') : console.log('Number is not Happy')
