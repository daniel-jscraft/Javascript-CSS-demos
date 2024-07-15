/*
Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

 

Example 1:

Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]
Example 2:

Input: strs = [""]
Output: [[""]]
Example 3:

Input: strs = ["a"]
Output: [["a"]]
 

Constraints:

1 <= strs.length <= 104
0 <= strs[i].length <= 100
strs[i] consists of lowercase English letters.
*/
// Input: strs = ["eat","tea","tan","ate","nat","bat"]
// Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

// check this https://www.youtube.com/watch?v=WalLC8nlrPk

let isAnagram = (x, y)=> {
    let xMap = {}
    for (c of x) 
        (c in xMap) ? xMap[c] += 1 : xMap[c] = 1
    let result = true
    for (c of y) 
        (xMap[c] > 0) ? xMap[c] -= 1 : result = false
    return result
}

let input = ["eat","tea","tan","ate","nat","bat"]
let output = []

while (input.length > 0) {
    
    console.log(input)
    let active = input.pop()
    let row = [active]
    for (word of input) 
        if (isAnagram(active, word)) {
            row.push(word)
            input = input.filter(w => !w.localeCompare(word))
        }
}

console.log(output)

