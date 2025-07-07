import React from 'react';
import classNames from 'classnames';
import { IFormFieldValue, IInputCharLimit, InputCharLimit } from '@desp-aas/desp-ui-fwk';
import { CodeiumEditor, CodeiumEditorProps } from "@codeium/react-code-editor";


import './CodeArea.css';


export type ICodeAreaProps = CodeiumEditorProps;

export function CodeArea(props: {
    className?: string
    charLimit?: IInputCharLimit
    placeholder?: string
    id?: string
    value?: IFormFieldValue
    onUpdate?: (value:IFormFieldValue)=>any
    onEnter?: ((value: IFormFieldValue)=>any)|undefined
    language: string
    codeAreaProps?: Partial<ICodeAreaProps>
    disabled?: boolean
}){
    return <div id={props.id} className={classNames({ "code-area": true, [props.className || '']: true, "disabled": props.disabled })}>
        <CodeiumEditor
            value={props.value || ''}
            onChange={props.onUpdate}
            language={props.language}
            // onKeyDown={(ev) => {
            //     if (ev.ctrlKey && ev.key === 'Enter') {
            //         console.log("GOT CTRL ENTER")
            //         props.onEnter?.(props.value)
            //     }
            // }}
            options={{readOnly: !!props.disabled}}
            {...props.codeAreaProps}
        />
            


        {
            props.charLimit &&
            <InputCharLimit
                value={props.value}
                charLimit={props.charLimit}
            />
        }
    </div>
}
export default CodeArea;