import { ButtonHTMLAttributes } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  fullWidth?: boolean;
};

export function PrimaryButton({ fullWidth, className, ...props }: PrimaryButtonProps) {
  const classes = ["btn", "btn-primary"];
  if (fullWidth) classes.push("w-full");
  if (className) classes.push(className);

  return <button className={classes.join(" ")} {...props} />;
}
