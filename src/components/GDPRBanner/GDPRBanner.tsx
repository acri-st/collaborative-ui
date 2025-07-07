// @ts-ignore
import Toggle from 'react-toggle'; 
import classNames from 'classnames';
import React,{ Component, ReactNode, useCallback, useState } from 'react';
import Styles from './GDPRBanner.module.css';

const DURATION = (24*60*60*1000);

export type GDPRConsent = {
    [consent_name: string]: boolean
}


export interface GDPRState{
    open?: boolean
    consent_data?: GDPRConsent
}


interface IProps<ActionType> {
    open?: boolean;
    title?: string;
    message?: string;
    i18n: Record<string, string>;
    consent_options?:{[key:string]: string|React.ReactNode};
    hide_functional_option?: boolean;
    dark?: boolean
    link?: string|Function
    children?: ReactNode

    setGDPR: ActionType;
}
interface State{
    // show?:boolean
    policy_updated?: boolean
    mandatory: boolean
    consent_options_open: boolean

    // For consent updates
    consent_data?: GDPRConsent
    view_file:boolean
}
function get_link(link: string | Function) {
    return (typeof link === 'string' ? link : undefined) || "https://www.acri-st.fr/wp-content/uploads/2019/04/ACRI-ST_GDPR.pdf";
}

export function GDPRBanner<ActionType>(props: IProps<ActionType>) {
    const [policy_updated, updatePolicy] = useState<boolean>(false);
    const [consent_options_open, set_consent_options_open] = useState<boolean>(false);
    const readPolicyClickHandler = useCallback(function() {
        if (typeof props.link === 'string') return;
        props.link?.();
    }, [props.link]);
    return (
        <div className={classNames(Styles.gdprBanner, props.open && Styles.open, props.dark && Styles.dark)}>
            <div className={Styles.gdprContent}>
                { props.children || <>
                    <h3 className={Styles.gdprTitle}>{ props.title || props.i18n['RT.GDPRBanner.title'] }</h3>
                    <div className={Styles.gdprMessage}>
                        { policy_updated &&<div className={Styles.gdprUpdatedMessage}>{props.i18n['RT.GDPRBanner.updated']}</div>}
                        <div>{props.message || props.i18n['RT.GDPRBanner.message']}</div>
                        {
                            // this.props.view_file ?
                            // <>
                            //     {
                            //         this.state.view_file &&
                            //         <ViewFile
                            //             no_header
                            //             external
                            //             opened={this.state.view_file}
                            //             close={()=>{ this.setState({ view_file: false }) }}
                            //             hide_details hide_download no_file_error
                            //             path={this.get_link()}
                            //             {
                            //                 ...this.props.ViewFileOptions
                            //             }
                            //         />
                            //     }
                            //     <div
                            //         className="link" onClick={()=>{ this.setState({ view_file: true }) }}
                            //     >
                            //         { get_intl_message({ id: 'RT.GDPRBanner.read.policy' }) }
                            //     </div>
                            // </>
                            // :
                            props.link ?
                                typeof props.link === 'string' 
                                ? <a 
                                    target="_blank" className={Styles.link}
                                    href={get_link(props.link)}
                                >{props.i18n['RT.GDPRBanner.read.policy']}</a>
                                : <div
                                    className={Styles.link} 
                                    onClick={readPolicyClickHandler}
                                >{props.i18n['RT.GDPRBanner.read.policy']}</div>
                            : null
                        }
                        </div>
                    </>
                }
            </div>

            <div className={Styles.gdprConsent}>{
                // TODO
                // props.consent_options ? <>
                //     <button 
                //         className={classNames(Styles.gdprButton, Styles.settings, consent_options_open && Styles.toggled)}
                //         onClick={()=> this.setState({ consent_options_open: !this.state.consent_options_open })}
                //     >
                //         <i className="fas fa-cog"/> 
                //         {props.i18n['RT.GDPRBanner.open.settings']}
                //         <div className={Styles.gdprButtonToggle}><i  className="fas fa-chevron-right"/></div>
                //     </button>
                //     <button 
                //         className={classNames(Styles.gdprButton, Styles.refuseAll)}
                //         onClick={()=>this.consent(false)}
                //     >
                //         <i className="fas fa-ban"/> 
                //         {props.i18n['RT.GDPRBanner.refuse.all']}
                //     </button>
                //     <button 
                //         className={classNames(Styles.gdprButton, Styles.acceptAll)}
                //         onClick={()=>this.consent(true)}>
                //         <i className="fas fa-check-double"/>
                //         { props.i18n['RT.GDPRBanner.agree.all']}
                //     </button>
                // </>
                // :
                //     <button 
                //         className={Styles.gdprButton} 
                //         onClick={()=> this.consent()}>
                //         <i className="fas fa-check"/>
                //         { props.i18n['RT.GDPRBanner.agree'] }
                //     </button>
                }
            </div>  
            {
                props.consent_options &&
                consent_options_open &&
                <>
                    <h3 className={Styles.gdprSubTitle}>{props.i18n['RT.GDPRBanner.manage.preferences']}</h3>
                    <div className="gdpr-consent-data-container">
                        {
                            // TODO
                            // !props.hide_functional_option &&
                            // <div className={Styles.gdprConsentData}>
                            //         <div className={Styles.gdprConsentDataDescription}>{props.i18n['RT.GDPRBanner.functional.option']}</div>
                            //         <div className="gdpr-consent-data-toggle">
                            //             <Toggle
                            //                 disabled
                            //                 checked={true}
                            //             />
                            //         </div>
                            //     </div>
                        }
                        {
                            // TODO
                            // Object.keys(props.consent_options).map((key:string)=>(
                            //     <div className={Styles.gdprConsentData}
                            //         data-key={key}
                            //         key={key}
                            //         onClick={(e)=>{
                            //             this.toggle_consent(key)
                            //         }}
                            //     >
                            //         <div className={Styles.gdprConsentDataDescription}>{props.consent_options?.[key]}</div>
                            //         <div className={Styles.gdprConsentDataToggle}>
                            //             <Toggle
                            //                 // className="themed-toggle"
                            //                 checked={!!this.state.consent_data?.[key]}
                            //             />
                            //         </div>
                            //     </div>
                            // ))
                        }
                    </div>
                    <br/>
                    {/* TODO */}
                    {/* <button 
                        className={Styles.gdprButton} 
                        onClick={()=> this.consent()}
                    >
                        <i className="fas fa-check"/>
                        {props.i18n['RT.GDPRBanner.confirm.settings']}
                    </button> */}
                </>
            }

            {
                // TODO
                // !this.state.mandatory &&
                // <div className="centered">
                //     <div 
                //         className={Styles.gdprClose} 
                //         onClick={()=> this.props.setGDPR({ open: false }) }
                //     >{ props.i18n['RT.GDPRBanner.close'] }</div>
                // </div>
            }

        </div>
    );
}
