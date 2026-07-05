function changeConversionType() {
    const type = document.getElementById('conversion-type').value;
    const fromUnitSelect = document.getElementById('from-unit');
    const toUnitSelect = document.getElementById('to-unit');

    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';

    let options = [];

    if (type === 'length') {
        options = [
            { value: 'mm', text: 'Millimeter (mm)' },
            { value: 'cm', text: 'Centimeter (cm)' },
            { value: 'm', text: 'Meter (m)' },
            { value: 'km', text: 'Kilometer (km)' },
            { value: 'inch', text: 'Inch' },
            { value: 'foot', text: 'Foot' },
            { value: 'yard', text: 'Yard' },
            { value: 'mile', text: 'Mile' }
        ];
    } else if (type === 'weight') {
        options = [
            { value: 'mg', text: 'Milligram (mg)' },
            { value: 'g', text: 'Gram (g)' },
            { value: 'kg', text: 'Kilogram (kg)' },
            { value: 'oz', text: 'Ounce (oz)' },
            { value: 'lb', text: 'Pound (lb)' }
        ];
    } else if (type === 'volume') {
        options = [
            { value: 'ml', text: 'Milliliter (ml)' },
            { value: 'l', text: 'Liter (L)' },
            { value: 'oz', text: 'Fluid Ounce (fl oz)' },
            { value: 'cup', text: 'Cup' },
            { value: 'gallon', text: 'Gallon' }
        ];
    } else if (type === 'area') {
        options = [
            { value: 'cm2', text: 'Square Centimeter (cm²)' },
            { value: 'm2', text: 'Square Meter (m²)' },
            { value: 'km2', text: 'Square Kilometer (km²)' },
            { value: 'ha', text: 'Hectare (ha)' },
            { value: 'acre', text: 'Acre' },
            { value: 'ft2', text: 'Square Foot (ft²)' }
        ];
    } else if (type === 'speed') {
        options = [
            { value: 'm/s', text: 'Meter/second (m/s)' },
            { value: 'km/h', text: 'Kilometer/hour (km/h)' },
            { value: 'mph', text: 'Mile/hour (mph)' },
            { value: 'knot', text: 'Knot' }
        ];
    } else if (type === 'temperature') {
        options = [
            { value: 'C', text: 'Celsius (°C)' },
            { value: 'F', text: 'Fahrenheit (°F)' },
            { value: 'K', text: 'Kelvin (K)' }
        ];
    }

    options.forEach(opt => {
        fromUnitSelect.appendChild(new Option(opt.text, opt.value));
        toUnitSelect.appendChild(new Option(opt.text, opt.value));
    });

    if (toUnitSelect.options.length > 1) {
        toUnitSelect.selectedIndex = 1;
    }

    hideResult();
    clearError();
}

function convertUnits() {
    try {
        clearError();

        const type = document.getElementById('conversion-type').value;
        const value = getInputValue('from-value');
        const fromUnit = document.getElementById('from-unit').value;
        const toUnit = document.getElementById('to-unit').value;

        if (value === null || isNaN(value)) {
            throw new Error('Please enter a valid number');
        }

        let result;

        if (type === 'length') {
            result = convertLength(value, fromUnit, toUnit);
        } else if (type === 'weight') {
            result = convertWeight(value, fromUnit, toUnit);
        } else if (type === 'volume') {
            result = convertVolume(value, fromUnit, toUnit);
            } else if (type === 'area') {
                result = convertArea(value, fromUnit, toUnit);
            } else if (type === 'speed') {
                result = convertSpeed(value, fromUnit, toUnit);
        } else if (type === 'temperature') {
            result = convertTemperature(value, fromUnit, toUnit);
        }

        document.getElementById('result-label-from').textContent = value + ' ' + fromUnit;
        document.getElementById('result-label-to').textContent = 'Equals in ' + toUnit;
        document.getElementById('result-from').textContent = formatNumber(value, 4);
        document.getElementById('result-to').textContent = formatNumber(result, 4);

        showResult();
    } catch (error) {
        showError(error.message);
    }
}

function convertSpeed(value, fromUnit, toUnit) {
    // normalize to meters per second
    let mps;
    const v = parseFloat(value);
    switch (fromUnit) {
        case 'm/s': mps = v; break;
        case 'km/h': mps = v / 3.6; break;
        case 'mph': mps = v * 0.44704; break;
        case 'knot': mps = v * 0.514444; break;
        default: mps = v; break;
    }

    let out;
    switch (toUnit) {
        case 'm/s': out = mps; break;
        case 'km/h': out = mps * 3.6; break;
        case 'mph': out = mps / 0.44704; break;
        case 'knot': out = mps / 0.514444; break;
        default: out = mps; break;
    }
    return out;
}

function convertArea(value, fromUnit, toUnit) {
    // normalize to square meters
    const v = parseFloat(value);
    let m2;
    switch (fromUnit) {
        case 'cm2': m2 = v * 0.0001; break;
        case 'm2': m2 = v; break;
        case 'km2': m2 = v * 1e6; break;
        case 'ha': m2 = v * 10000; break;
        case 'acre': m2 = v * 4046.8564224; break;
        case 'ft2': m2 = v * 0.09290304; break;
        default: m2 = v; break;
    }

    let out;
    switch (toUnit) {
        case 'cm2': out = m2 / 0.0001; break;
        case 'm2': out = m2; break;
        case 'km2': out = m2 / 1e6; break;
        case 'ha': out = m2 / 10000; break;
        case 'acre': out = m2 / 4046.8564224; break;
        case 'ft2': out = m2 / 0.09290304; break;
        default: out = m2; break;
    }
    return out;
}

function resetConverter() {
    document.getElementById('from-value').value = '';
    hideResult();
    clearError();
}

document.addEventListener('DOMContentLoaded', function() {
    changeConversionType();
    document.getElementById('conversion-type').addEventListener('change', changeConversionType);
    document.getElementById('from-value').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            convertUnits();
        }
    });
});
