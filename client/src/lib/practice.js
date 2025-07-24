function converter(min){
    const minToHr = min / 60;
    const arr = minToHr.toString().split(".");
    // const minutesRemainder = min % 60;
    // console.log(minToHr)
    // console.log(minutesRemainder)

    console.log( Math.floor(minToHr) + " " + arr[1] * 6)
}

converter(102)