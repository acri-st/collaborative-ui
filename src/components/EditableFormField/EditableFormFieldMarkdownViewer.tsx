import { useEffect } from "react";
import { useRef } from "react";
import { IEditableFormFieldProps } from "./EditableFormField"
import { Viewer as Markdown } from '@toast-ui/react-editor';

export const EditableFormFieldMarkdownViewer = (props: IEditableFormFieldProps) => {

    const viewerRef = useRef<Markdown>(null);

    useEffect(() => {
        if (viewerRef.current) {
            viewerRef.current.getInstance().setMarkdown(props.value);
        }
    }, [props.value]);

    return (
        <Markdown
            ref={viewerRef}
            initialValue={props.value}
        />
    )
}