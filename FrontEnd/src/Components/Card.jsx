import "./Card.css";

export default function Card({ title, points, img, link }) {
  return (
    <div className="card" >
      <img src={img} className="card-img-top" alt={title} />
      <div className="card-body">
        <h4 className="card-title" style={{textAlign:"center"}}>{title}</h4>
        <ul>
          {points.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
        <a href={link} className="btn btn-primary">Know More</a>
      </div>
    </div>
  );
}