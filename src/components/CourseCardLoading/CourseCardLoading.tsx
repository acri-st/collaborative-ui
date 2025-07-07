import './CourseCardLoading.css'


export function CourseCardLoading() {
    return <div
        className="course-card-loading loading"
    >
        <div className="course-card-loading-image"/>

        <div className="course-card-loading-title"/>
        <div className="course-card-loading-title reduced"/>

        <div className="course-card-loading-description"/>
        <div className="course-card-loading-description"/>
        <div className="course-card-loading-description"/>
        <div className="course-card-loading-description reduced"/>
    </div>
}
