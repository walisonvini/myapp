import { Text, TouchableOpacity, TouchableOpacityProps } from "react-native";
import styles from "./button.styles";

function Button({title, ...rest}: TouchableOpacityProps & {title: string}) {
    return (
        <TouchableOpacity {...rest} style={styles.button}>
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    )
}

export default Button;