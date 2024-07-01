/*
Given an input string s, reverse the order of the words.

A word is defined as a sequence of non-space characters. The words in s will be separated by at least one space.

Return a string of the words in reverse order concatenated by a single space.

Note that s may contain leading or trailing spaces or multiple spaces between two words. The returned string should only have a single space separating the words. Do not include any extra spaces.

Example 1:

Input: s = "the sky is blue"
Output: "blue is sky the"
Example 2:

Input: s = "  hello world  "
Output: "world hello"
Explanation: Your reversed string should not contain leading or trailing spaces.
Example 3:

Input: s = "a good   example"
Output: "example good a"
Explanation: You need to reduce multiple spaces between two words to a single space in the reversed string.
*/

let input = "a good   example"

let getWords = input => {
    let words = []
    let word = ""
    for(let char of input) {
        if(char !== " ") {
            word += char
        }
        else {
            word.length && words.push(word)
            word = ""
        }
    }
    word.length && words.push(word)
    return words
}

let reverseWords = words => {
    let reverse = ""
    for(let i = words.length - 1; i > 0; i--) 
        reverse = reverse + words[i] + " "
    reverse = reverse + words[0]
    return reverse
}

let words = getWords(input)
let reverse = reverseWords(words)
console.log(reverse)

