import { getVideosByCourse } from './assets';

function CourseVideoList({ courseId }) {
  const videos = getVideosByCourse(courseId);

  return (
    <div className="video-list">
      <h2>Course Videos</h2>
      {videos.map(video => (
        <div key={video.id} className="video-item">
          <img src={video.thumbnail} alt={video.title} />
          <div className="video-details">
            <h4>Lesson {video.lessonNumber}: {video.title}</h4>
            <p>{video.description}</p>
            <span>{video.duration}</span>
          </div>
        </div>
      ))}
    </div>
  );
}