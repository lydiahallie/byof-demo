export const Image = (
  props: Partial<HTMLImageElement> &
    Required<Pick<HTMLImageElement, "src" | "height" | "width">>
) => {
  return (
    <img
      {...props}
      width={props.width}
      height={props.height}
      loading={props.loading ? props.loading : "lazy"}
      src={`/_vercel/image?url=${encodeURIComponent(props.src)}&w=${
        props.width * 1.5
      }&q=75`}
    />
  );
};
