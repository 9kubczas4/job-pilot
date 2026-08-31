export interface ApplyJobShowInput {
  jobId: string;
  note?: string;
}

export interface ApplyJobPresentation {
  requestId: number;
  jobId: string;
  jobTitle: string;
  companyName: string;
  note: string;
}

export interface ApplyJobShowResult {
  displayed: true;
  jobId: string;
  jobTitle: string;
  companyName: string;
  prefilledNote: string;
}
