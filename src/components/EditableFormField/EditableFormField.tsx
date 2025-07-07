
import { FWKIcons, FormField, IFormFieldProps, Logger, getformFieldType, useFormFieldReady } from "@desp-aas/desp-ui-fwk"
import classNames from 'classnames';
import { ReactNode, useCallback, useEffect, useState } from "react"
import { FaCheck } from "react-icons/fa6";
import './EditableFormField.css';
import Tags from "@desp-aas/desp-ui-fwk/src/components/Tags/Tags";
import { EditableFormFieldMarkdownViewer } from "./EditableFormFieldMarkdownViewer";

const logger = new Logger('component', 'EditableFormField')

export type IEditableFormFieldProps = {
    // Forces the state of editing
    editing?: boolean
    disabledEditable?: boolean
    confirmBeforeUpdate?: boolean
    removeButtons?: boolean
    displayedValue?: ReactNode
    disableConfirm?: boolean
    editableFormFieldClassName?: string
    notNull?: boolean
} & IFormFieldProps

export const EditableFormField = (props: IEditableFormFieldProps) => {

    const [editing, setEditing] = useState(props.editing || false);
    const [value, setValue] = useState(props.value);

    useEffect(() => {
        setValue(props.value);
    }, [props.value])

    useEffect(() => {
        setEditing(props.editing || false);
    }, [props.editing])


    const formFieldReady = useFormFieldReady({ validation: props.validation }, props.value)
    

    const ready = useFormFieldReady(props, value ) && formFieldReady && (props.notNull ? value !== '' : true)

    const onUpdate = useCallback((value: any) => {
        if (props.confirmBeforeUpdate)
            setValue(value)
        else
            props.onUpdate(value)
    }, [value, props.confirmBeforeUpdate, props.onUpdate])

    const onEnter = useCallback((value: any) => {
        if (props.onEnter && ready) {
            if (props.confirmBeforeUpdate) {
                props.onEnter(value)
                setEditing(false)
            }
            else {
                props.onEnter(value)
            }
        }
    }, [props.confirmBeforeUpdate, editing, ready])


    return (
        <div className={classNames({
            "editable-form-field": true,
            "editing": editing,
            "viewing": !editing,
            "with-label": !!props.label,
            [getformFieldType(props)]: true,
            [props.editableFormFieldClassName || '']: true
        })}>
            {
                editing
                    ?
                    <>
                        <FormField
                            {...props}
                            value={props.confirmBeforeUpdate ? value : props.value}
                            onUpdate={onUpdate}
                            onEnter={onEnter}
                            disabled={props.disableConfirm}
                        />
                        {
                            !props.removeButtons && props.confirmBeforeUpdate &&
                            <div className="editable-buttons">
                                {

                                    (value !== props.value)
                                    &&
                                    <div
                                        className={classNames({ 
                                            "button confirm-button editable-button operation green": true,
                                            "disabled": props.disableConfirm || !ready
                                        })}
                                        onClick={() => {
                                            if(!props.disableConfirm){
                                                props.onUpdate(value)
                                                setEditing(false)
                                            }
                                        }}
                                    >
                                        <FaCheck /> Confirm
                                    </div>
                                }
                                <div
                                    className={classNames({ "button cancel-button editable-button operation": true })}
                                    onClick={() => { setEditing(false); setValue(props.value) }}
                                >
                                    {FWKIcons.cancel} Cancel
                                </div>
                            </div>
                        }
                    </>
                    :
                    <>
                        <div className="form-field">
                            {
                                props.label &&
                                <label>
                                    {props.label}:
                                </label>
                            }
                            <div className="form-field-value">
                                {
                                    props.value === undefined || props.value === null || props.value === '' 
                                        ?
                                        props?.placeholder
                                            ? <div className="no-data-value">{props.placeholder}</div>
                                            : <div className="no-data-value">No value</div>
                                        :
                                        props.richText
                                        ? <>
                                            <div className="editable-field-rich-text-value form-field-rich-text">
                                                <EditableFormFieldMarkdownViewer {...props} />
                                            </div>
                                        </>
                                        : props.select
                                            ?
                                            props.select.multiple
                                                ? <Tags tags={props.select.options.filter((opt)=>props.value.includes(opt.value)).map((opt) => { return { label: opt.label || opt.value } })} />
                                                // ? <Tags tags={props.select.options.map((opt) => { return { label: opt.label || opt.value } })} />
                                                : props.select.options.find((o) => o.value === props.value)?.label
                                            :  
                                                props.displayedValue || props.value
                                }
                            </div>
                        </div>
                        {
                            !props.removeButtons && !props.disabledEditable &&
                            <div className="editable-buttons">
                                <div
                                    className="button edit-button editable-button operation blue"
                                    onClick={() => setEditing(true)}
                                >
                                    {FWKIcons.edit} Edit
                                </div>
                            </div>
                        }
                    </>
            }
        </div>
    )
}

