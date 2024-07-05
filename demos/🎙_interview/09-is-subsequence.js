/*
Given two strings s and t, return true if s is a subsequence of t, or false otherwise.

A subsequence of a string is a new string that is formed from the original string by deleting some (can be none) of the characters without disturbing the relative positions of the remaining characters. (i.e., "ace" is a subsequence of "abcde" while "aec" is not).

 

Example 1:

Input: s = "abc", t = "ahbgdc"
Output: true
Example 2:

Input: s = "axc", t = "ahbgdc"
Output: false
*/

let t = "ahbgdc"
let s = "axc"

const cutString = (intialS, from) => {
    let s = ''
    for (let i = from + 1; i < intialS.length; i++) 
        s = s + intialS.charAt(i)
    return s
}

const findInString = (s, c) => {
    for (let i = 0; i < s.length; i++) 
        if(s.charAt(i) === c) 
            return i
    return null
}

let index = 0
let isSubSequence = true 

while(isSubSequence && (index < s.length)) {
    let cutFrom = findInString(t, s.charAt(index))
    if (cutFrom !== null) 
        t = cutString(t, cutFrom)
    else 
        isSubSequence = false
    index++
}

console.log(`Is subsequence = ${isSubSequence}`)



