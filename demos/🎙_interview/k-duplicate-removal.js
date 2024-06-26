// https://www.youtube.com/watch?v=w6LcypDgC4w
// deeedbbcccbdaa


let inputS = 'deeedbbcccbdaa'
let input = inputS.split('')
const k = 3

const checkForDuplicateK = start => {
    let i = start
    let isDuplicateK = true
    while(isDuplicateK && (i < start + k - 1)) {
        isDuplicateK = input[i] === input[i+1]
        i++
    }
    return isDuplicateK
}

const removeSubArray = (input, from) => input.filter(
    (val, index) => ((index < from) || (index > from + k))
)

const removeDuplicatesK = (input) => {
    let final = true
    for (let i = 0; i < input.length - k; i++) {
        let isDuplicateK = checkForDuplicateK(i)
        if(isDuplicateK) {
            let updated = removeSubArray(input, i)
            final = false
            removeDuplicatesK(updated)
        }
    }
    final && console.log(input)
}

removeDuplicatesK(input)

