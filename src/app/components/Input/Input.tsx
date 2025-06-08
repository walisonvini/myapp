import { TextInput, TextInputProps } from "react-native";
import styles from "./input.styles";
    
function Input({...rest }: TextInputProps) {
    return <TextInput {...rest} style={styles.input} />
}

export default Input;