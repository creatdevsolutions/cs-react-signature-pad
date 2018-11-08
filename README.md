# React Signature Pad
A [signature pad](https://github.com/creatdevsolutions/cs-react-signature-pad) implementation for react in Typescript.

# Basic Usage

```javascript

interface Props {

}

interface State {

}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.signaturePadRef = React.createFef<SignaturePad>();
    }

    render() {
        return (
            <SignaturePad
                ref={this.signaturePadRef}
                className={styles.SignaturePad}
            />
        )
    }

    componentDidMount() {
        const signaturePad: SignaturePad = this.signaturePadRef.current;

       // do some stuff
    }
}


```

# Props



| Name | Optional | DefaultValue | Description
| -------- | -------- | -------- | --------
| penColor     | true     | #000000     | Sets the color of the pen to draw
| backgroundColor     | true     | #FFFFFF     | Sets the backgroundColor of the canvas
| defaultImage     | true     | undefined     | Fills the Signaturepad on mounting with this image, does not set it on reset
| height     | false     | 150     | Height in pixel of the pad
| width     | false     | 300     | Width in pixel of the pad
| onEnd     | true     | -     | Callback, fired when drawing a line ends
| onBegin     | true     | -     | Callback, fired when drawing a line begins
| ref     | false     | -     | React ref for the pad, only possible way to get data out of the pad

# Methods

```javascript
const signaturePad: SignaturePad = this.signaturePadRef.current;

// Methods

// ===============================================
// isEmpty() - returns boolean
// ===============================================

signaturePad.isEmpty();

// ===============================================
// clear() - clears canvas
// ===============================================

signaturePad.clear();

// ===============================================
// toDataURL() - retrieves image as a data url
// ===============================================

signaturePad.toDataURL();

// ===============================================
// fromDataURL() - writes a base64 image to canvas
// ===============================================

signaturePad.fromDataURL(base64String);

```

# Example
```bash
$ npm start
```
Then navigate to http://localhost:3000/ in your browser and you should be able to see the signature pad in action.
