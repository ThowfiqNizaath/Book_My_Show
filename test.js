const obj = {}
const user = "userName"
const arr = ["A1", "B2", "C3", "D4", "E5"]

const newArr = arr.forEach(seat => {
   return obj[seat] = user;
})

const obj2 = {
  date1: ["A1", "B2", "C3", "D4", "E5"],
  date2: ["A1", "B2", "C3", "D4", "E5"],
};
console.clear()
console.log(obj2)
console.log(Object.entries(obj2).map(([date, time]) => ({date, time})))
