// https://www.youtube.com/watch?v=5WZl3MMT0Eg
// [-2, 1, -3, 4, -1, 2, 1, -5, 4]
// 6
// [4, -1, 2, 1]

const vector = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
let maxSum = -999999999
let maxSumStartIndex = null
let maxSumEndIndex = null


const makeSumSub = (startIndex, endIndex) => {
    let subSum = 0
    for (let i = startIndex; i <= endIndex; i++) {
        subSum += vector[i]
    }
    return subSum
}

const printSolution = ()=> {
    console.log(`⭐️ MAX SUM = ${maxSum}`)
    let subArray = '[ '
    for (let i = maxSumStartIndex; i <= maxSumEndIndex; i++) {
        subArray = subArray + `${vector[i]}, `
    }
    subArray +=' ]'
    console.log(`⭐️ MAX SUB ARRAY = ${subArray}`)
}

for (let startIndex = 0; startIndex < vector.length - 2; startIndex++) {
    for (let i = vector.length - 1; i > startIndex; i--) {
        const subSum = makeSumSub(startIndex, i)
        if (subSum >= maxSum) {
            maxSum = subSum
            maxSumStartIndex = startIndex
            maxSumEndIndex = i
        } 
    }
}

printSolution()




