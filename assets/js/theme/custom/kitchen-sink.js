const toRem = (px) => {
    const fontSize = parseFloat(window.getComputedStyle(document.querySelector('html'), null).getPropertyValue('font-size'));
    return px / fontSize;
};

const getInRem = (string) => {
    const pva = string.split(' ');
    const values = pva.map(item => {
        const regex = /px/gi;
        const px = item.replace(regex, '');

        if (px === 'auto' || Number(px) === 0) return px;

        const rems = toRem(Number(px));
        return `${rems.toFixed(2)}rem`;
    });

    return values.join(' ');
};

const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? `0${hex}` : hex;
};

const rgbToHex = (r, g, b) => `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;

const getInHex = (string) => {
    const rgbValues = string.slice(string.indexOf('(') + 1, string.indexOf(')')).split(',');
    const r = Number(rgbValues[0]);
    const g = Number(rgbValues[1]);
    const b = Number(rgbValues[2]);
    return rgbToHex(r, g, b);
};

const loadContainerStyleData = () => {
    $('#ks-containers .ks-element__sub').each((idx, item) => {
        const title = `.ks-${$('.ks-element__sub-title', item).data('ks-type')}`;
        const width = 'bugged for now';
        const maxWidth = window.getComputedStyle(document.querySelector(title)).getPropertyValue('max-width');
        const margin = getInRem(window.getComputedStyle(document.querySelector(title)).getPropertyValue('margin'));
        const padding = getInRem(window.getComputedStyle(document.querySelector(title)).getPropertyValue('padding'));
        const float = window.getComputedStyle(document.querySelector(title)).getPropertyValue('float');

        const styles = `
            <div class="styles-data-table">
            <table>
                <tbody>
                    <tr>
                        <th>Width</th>
                        <th>Max Width</th>
                        <th>Margin</th>
                        <th>Padding</th>
                        <th>Float</th>
                    </tr>
                    <tr>
                        <td>${width}</td>
                        <td>${maxWidth}</td>
                        <td>${margin}</td>
                        <td>${padding}</td>
                        <td>${float}</td>
                    </tr>
                </tbody>
            </table>
            </div>
        `;

        $('.ks-element__sub-container', item).append(styles);
    });
};

const loadPaletteStyleData = () => {
    $('#ks-palette .ks-element__sub').each((idx, item) => {
        const colorElements = $('.ks-palette__box', item);

        colorElements.each((idx, el) => {
            const color = getInHex(window.getComputedStyle(el).getPropertyValue('background-color'));
            $(el).find('.ks-palette__label--hex').text(color);
        });
    });
};

const loadTypographyStyleData = () => {
    $('#ks-typography .ks-element__sub').each((idx, item) => {
        const title = `.ks-${$('.ks-element__sub-title', item).text()}`;
        const color = getInHex(window.getComputedStyle(document.querySelector(title)).getPropertyValue('color'));
        const fontSize = window.getComputedStyle(document.querySelector(title)).getPropertyValue('font-size');
        const fontFamily = window.getComputedStyle(document.querySelector(title)).getPropertyValue('font-family');
        const fontWeight = window.getComputedStyle(document.querySelector(title)).getPropertyValue('font-weight');
        const margin = getInRem(window.getComputedStyle(document.querySelector(title)).getPropertyValue('margin'));
        const padding = getInRem(window.getComputedStyle(document.querySelector(title)).getPropertyValue('padding'));

        const styles = `
            <div class="styles-data-table">
                <table>
                    <tbody>
                        <tr>
                            <th>Color</th>
                            <th>Font Size</th>
                            <th>Font Family</th>
                            <th>Font Weight</th>
                            <th>Margin</th>
                            <th>Padding</th>
                        </tr>
                        <tr>
                            <td>${color}</td>
                            <td>${fontSize}</td>
                            <td>${fontFamily}</td>
                            <td>${fontWeight}</td>
                            <td>${margin}</td>
                            <td>${padding}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        $('.ks-element__sub-container', item).prepend(styles);
    });
};
const loadButtonStyleData = () => {
    $('#ks-buttons .ks-element__sub').each((idx, item) => {
        const buttonClass = `.button--${$('.ks-element__sub-title', item).text()}`.toLowerCase();

        const tableRows = $(buttonClass, item).toArray().map(button => {
            console.log('button ', getInHex(window.getComputedStyle(button).getPropertyValue('background-color')));
            const type = $(button).data('button-type');
            const color = getInHex(window.getComputedStyle(button).getPropertyValue('color'));
            const backgroundColor = getInHex(window.getComputedStyle(button).getPropertyValue('background-color'));
            const fontSize = window.getComputedStyle(button).getPropertyValue('font-size');
            const fontFamily = window.getComputedStyle(button).getPropertyValue('font-family');
            const fontWeight = window.getComputedStyle(button).getPropertyValue('font-weight');
            const borderWidth = window.getComputedStyle(button).getPropertyValue('border-width');
            const borderStyle = window.getComputedStyle(button).getPropertyValue('border-style');
            const borderColor = getInHex(window.getComputedStyle(button).getPropertyValue('border-color'));
            const margin = getInRem(window.getComputedStyle(button).getPropertyValue('margin'));
            const padding = getInRem(window.getComputedStyle(button).getPropertyValue('padding'));

            const tr = `
                <tr>
                    <td>${type}</td>
                    <td>${color}</td>
                    <td>${backgroundColor}</td>
                    <td>${fontSize}</td>
                    <td>${fontFamily}</td>
                    <td>${fontWeight}</td>
                    <td>${borderWidth} ${borderStyle} ${borderColor}</td>
                    <td>${margin}</td>
                    <td>${padding}</td>
                </tr>
            `;
            return tr;
        });

        const styles = `
            <div class="styles-data-table">
                <table>
                    <tbody>
                        <tr>
                            <th>Type</th>
                            <th>Color</th>
                            <th>Background Color</th>
                            <th>Font Size</th>
                            <th>Font Family</th>
                            <th>Font Weight</th>
                            <th>Border</th>
                            <th>Margin</th>
                            <th>Padding</th>
                        </tr>
                        ${tableRows.join('', ',')}
                    </tbody>
                </table>
            </div>
        `;

        $('.ks-element__sub-container', item).prepend(styles);
    });
};

export default function (context) {
    const isActive = context.itsConfig.kitchen_sink;
    if (!isActive) return;

    loadContainerStyleData();
    loadPaletteStyleData();
    loadTypographyStyleData();
    loadButtonStyleData();
}
