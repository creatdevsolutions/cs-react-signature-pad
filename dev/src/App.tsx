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

const base64 = "data:image/png;base64,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";

interface Props {

}

interface State {
    width: number;
    height: number;
    isFullScreen: boolean;
    dotSize: number;
    penColor: string;
    backgroundColor: string;
}

class App extends React.Component<Props, State> {

    signaturePadRef: RefObject<SignaturePad>;

    constructor(props: Props) {
        super(props);

        this.signaturePadRef = React.createRef<SignaturePad>();
        this.state = {
            width: 600,
            height: 300,
            isFullScreen: false,
            dotSize: 3,
            penColor: "#000000",
            backgroundColor: "#FFFFFF"
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
                            <TextField
                                id="penColor"
                                label="Pen Color"
                                value={this.state.penColor}
                                onChange={this.handleTextfieldChange.bind(this, 'penColor')}
                                margin="normal"
                            />
                            <TextField
                                id="backgroundColor"
                                label="Background Color"
                                value={this.state.backgroundColor}
                                onChange={this.handleTextfieldChange.bind(this, 'backgroundColor')}
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
                            penColor={this.state.penColor}
                            dotSize={this.state.dotSize}
                            backgroundColor={this.state.backgroundColor}
                            defaultImage={base64}
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
                </div>
            </React.Fragment>
        )
    }
}

export default App;