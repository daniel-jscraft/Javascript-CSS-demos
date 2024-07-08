/*
A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string s, return true if it is a palindrome, or false otherwise.

 

Example 1:

Input: s = "A man, a plan, a canal: Panama"
Output: true
Explanation: "amanaplanacanalpanama" is a palindrome.
Example 2:

Input: s = "race a car"
Output: false
Explanation: "raceacar" is not a palindrome.
Example 3:

Input: s = " "
Output: true
Explanation: s is an empty string "" after removing non-alphanumeric characters.
Since an empty string reads the same forward and backward, it is a palindrome.
 
*/

let input = 'A man a plan a canal xPanama'

let removeNonAlphanumeric = s => {
    let result = ''
    for(let i = 0; i < s.length; i++) 
        if (s.charAt(i) != ' ')
            result += s.charAt(i)
    return result
}

let isPalindrome = s => {
    for (let i = 0; i < s.length / 2; i++) 
        if (s.charAt(i) !== s.charAt(s.length - 1 - i)) 
            return false
    return true
}

input = removeNonAlphanumeric(input)
input = input.toLowerCase()
console.log(isPalindrome(input))
