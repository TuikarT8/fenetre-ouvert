import { isEqual } from "lodash";
import { useState } from "react";

export function useDependencyObserver(observee, recurrence) {
    const [counter, setCounter] = useState(0);
    const [value, setValue] = useState(observee);
    
    function onObserveeChange(change) {
        if (counter < recurrence && !isEqual(change, value)) {
            setCounter(counter + 1);
            setValue(change);
        }
    }

    return [counter, onObserveeChange];
}