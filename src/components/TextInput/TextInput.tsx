import { TextField, InputAdornment, IconButton } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import { useState, forwardRef } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export type TextInputProps = Omit<
    TextFieldProps,
    "variant" | "error" | "helperText" | "fullWidth"
> & {
    errorText?: string;
    disablePasswordToggle?: boolean;
};

const TextInput = forwardRef<HTMLInputElement, TextInputProps>((props, ref) => {
    const { type, errorText, disablePasswordToggle, slotProps, ...rest } = props;

    const isPassword = type === "password";
    const [show, setShow] = useState(false);

    const endAdornment = isPassword && !disablePasswordToggle ? (
        <InputAdornment position="end" sx={{ pr: 1.5, }}>
            <IconButton
                onClick={() => setShow((s) => !s)}
                edge="end"
                aria-label={show ? "Скрыть пароль" : "Показать пароль"}
                sx={{
                    color: "#fff",
                }}
            >
                {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
        </InputAdornment>
    ) : undefined;

    return (
        <TextField
            ref={ref}
            fullWidth
            variant="outlined"
            type={isPassword && !disablePasswordToggle ? (show ? "text" : "password") : type}
            error={Boolean(errorText)}
            helperText={errorText}
            slotProps={{
                ...slotProps,
                input: {
                ...slotProps?.input,
                endAdornment,
                },
        }}
            {...rest}
        />
    );
});

TextInput.displayName = "TextInput";
export default TextInput;
