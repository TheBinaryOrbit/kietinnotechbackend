export const getTeamCode = (field) => {
    // get 4 digit random number
    const num = Math.floor(1000 + Math.random() * 9000);

    switch (field) {
        case "school":
            return `SH-${num}`;
        case "college":
            return `CL-${num}`;
        case "researcher":
            return `Rh-${num}`;
        case "startup":
            return `SU-${num}`;
        default:
            return `TM-${num}`;
    }
}


export const getUserCode = ()=>{
    // get 6 digit random number
    const num = Math.floor(100000 + Math.random() * 900000);
    return `INO${num}`;
}