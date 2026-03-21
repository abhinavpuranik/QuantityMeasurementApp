export function applyConversion(value, convObj) {
    if(!isFinite(value) || isNaN(value)) {
        throw new Error("Invalid number");

    }

    if(convObj.factor === 1 && convObj.formula === null) {
        return value;
    }

    try{
        if(convObj.factor !== null) {
            return parseFloat((value * convObj.factor).toFixed(6)); 
        }
        const expr = convObj.formula.replace("x", value);
        return parseFloat(eval(expr).toFixed(6)); 
    } catch(err) {
        throw new Error("Bad formula");
    }
}
