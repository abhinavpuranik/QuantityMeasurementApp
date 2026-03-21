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

export function performArithmetic(v1, v2normalised, op) {
    if (isNaN(v1) || isNaN(v2normalised)) {
        throw new Error("Invalid number");
    }

    switch (op) {
        case "+": return parseFloat((v1 + v2normalised).toFixed(6));
        case "-": return parseFloat((v1 - v2normalised).toFixed(6));
        case "*": return parseFloat((v1 * v2normalised).toFixed(6));
        case "/":
            if (v2normalised === 0) throw new Error("Divide by zero");
            return parseFloat((v1 / v2normalised).toFixed(6));
        default:
            throw new Error("Unknown operator");
    }
}
