import Image from "next/image";
import PropTypes from "prop-types";

const Loading = ({ width, height }) => {
  return (
    <Image
      src="assets/icons/loader.svg"
      width={width}
      height={height}
      alt="loader"
      className="object-contain"
    />
  );
};

export default Loading;

Loading.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};
