import * as React from "react";
import Card from "@material-ui/core/es/Card/Card";
import SignaturePad from "../../src/pad/SignaturePad";
import styles from "./App.css";
import {RefObject} from "react";
import Button from "@material-ui/core/es/Button/Button";
import * as FileSaver from 'file-saver';
import TextField from "@material-ui/core/es/TextField/TextField";
import Typography from "@material-ui/core/es/Typography/Typography";
import IconButton from "@material-ui/core/es/IconButton/IconButton";
import Icon from "@material-ui/core/es/Icon/Icon";

interface Props {

}

interface State {
    width: number;
    height: number;
    isFullScreen: boolean;
}

class App extends React.Component<Props, State> {

    signaturePadRef: RefObject<SignaturePad>;

    constructor(props: Props) {
        super(props);

        this.signaturePadRef = React.createRef<SignaturePad>();
        this.state = {
            width: 600,
            height: 300,
            isFullScreen: false
        };
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

    handleTextfieldChange(name: keyof State, e: any) {

        // @ts-ignore
        this.setState({
            [name]: e.target.value
        });
    }

    toggleFullScreen() {
        this.setState({
            isFullScreen: !this.state.isFullScreen
        });
    }

    clearSignature() {
        const signaturePad = this.signaturePadRef.current;
        signaturePad.clear();
    }

    render() {

        const closeFullScreenButton =
            <IconButton onClick={this.toggleFullScreen.bind(this)}>
                <Icon>
                    close
                </Icon>
            </IconButton>;

        return (
            <React.Fragment>
                <Card raised={true} className={styles.SignaturePadConfigurationCard}>
                    <Typography variant={"h6"}>
                        Configuration
                    </Typography>
                    <form>
                        <div className={styles.TextfieldGrid}>
                            <TextField
                                id="width"
                                label="Width"
                                value={this.state.width}
                                onChange={this.handleTextfieldChange.bind(this, 'width')}
                                margin="normal"
                            />
                            <TextField
                                id="height"
                                label="Height"
                                value={this.state.height}
                                onChange={this.handleTextfieldChange.bind(this, 'height')}
                                margin="normal"
                            />
                        </div>
                    </form>
                </Card>
                <div className={styles.SignaturePadCardContainer}>
                    <Card raised={true} className={styles.SignaturePadCard}>
                        <SignaturePad
                            ref={this.signaturePadRef}
                            className={styles.SignaturePad}
                            height={Number(this.state.height)}
                            width={Number(this.state.width)}
                            showFullScreen={this.state.isFullScreen}
                            fullScreenCloseAction={closeFullScreenButton}
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
                            <Button
                                onClick={this.toggleFullScreen.bind(this)}
                            >
                                Fullscreen
                            </Button>
                        </div>
                    </Card>
                </div>
            </React.Fragment>
        )
    }
}

export default App;