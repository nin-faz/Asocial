declare module "textarea-caret-position" {
  interface CaretCoordinates {
    top: number;
    left: number;
    height: number;
  }
  export default function getCaretCoordinates(
    element: HTMLTextAreaElement,
    position: number
  ): CaretCoordinates;
}
