import * as React from "react";
import Card from "@material-ui/core/es/Card/Card";
import SignaturePad from "../../src/pad/SignaturePad";
import styles from "./App.css";
import {RefObject} from "react";
import Button from "@material-ui/core/es/Button/Button";
import * as FileSaver from 'file-saver';

interface Props {

}

interface State {

}

class App extends React.Component<Props, State> {

    signaturePadRef: RefObject<SignaturePad>;

    constructor(props: Props) {
        super(props);

        this.signaturePadRef = React.createRef<SignaturePad>();
    }

    base64ToFile(base64Data: string, tempfilename: string, contentType: string) {
        contentType = contentType || '';
        const sliceSize = 1024;
        const byteCharacters = atob(base64Data.split(',')[1]);
        const bytesLength = byteCharacters.length;
        const slicesCount = Math.ceil(bytesLength / sliceSize);
        const byteArrays = new Array(slicesCount);

        for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
            const begin = sliceIndex * sliceSize;
            const end = Math.min(begin + sliceSize, bytesLength);

            const bytes = new Array(end - begin);
            for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new File(byteArrays, tempfilename, {type: contentType});
    }

    downloadFile() {
        const signaturePad = this.signaturePadRef.current;
        const base64 = signaturePad.toDataURL("png", 100);

        const myFile = this.base64ToFile(base64, "Signature.png", "png");
        FileSaver.saveAs(myFile, "Signature.png");
    }

    clearSignature() {
        const signaturePad = this.signaturePadRef.current;
        signaturePad.clear();
    }

    render() {
        return (
            <Card raised={true} className={styles.SignaturePadCard}>
                <SignaturePad
                    ref={this.signaturePadRef}
                    className={styles.SignaturePad}
                    height={300}
                    width={600}
                />
                <div className={styles.ButtonList}>
                    <Button
                        color={"primary"}
                        onClick={this.downloadFile.bind(this)}
                    >
                        Save
                    </Button>
                    <Button
                        color={"secondary"}
                        onClick={this.clearSignature.bind(this)}
                    >
                        Clear
                    </Button>
                </div>
            </Card>
        )
    }
}

export default App;