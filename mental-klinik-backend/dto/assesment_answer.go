package dto

type AssessmentAnswers struct {
	SchizophreniaShare   float64 `json:"schizophrenia_share"`
	AnxietyShare         float64 `json:"anxiety_share"`
	BipolarShare         float64 `json:"bipolar_share"`
	EatingDisorderShare  float64 `json:"eating_disorder_share"`
	DALYs                float64 `json:"DALYs"`
	DepressionDALYs      float64 `json:"depression_dalys"`
	SchizophreniaDALYs   float64 `json:"schizophrenia_dalys"`
	BipolarDALYs         float64 `json:"bipolar_dalys"`
	EatingDALYs          float64 `json:"eating_dalys"`
	AnxietyDALYs         float64 `json:"anxiety_dalys"`
	SuicideRate          float64 `json:"suicide_rate"`
}