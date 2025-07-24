const timeFormate = (min = 0) => {
    const minHr = Math.floor(min / 60);
    const remainderMin = min % 60;
    return `${minHr}h ${remainderMin}m`
}

export default timeFormate