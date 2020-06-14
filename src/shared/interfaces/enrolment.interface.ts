export interface Enrolment {
  year: string;
  sex: string;
  course: string;
  intake: string;
  enrolment: string;
  graduates: string;
  id: string;
}

export interface EnrolmentNode extends Enrolment{
  x: number;
  y: number;
  radius: number;
}
