package services

// HealthService provides health check responses.
type HealthService struct{}

func NewHealthService() *HealthService {
	return &HealthService{}
}

func (s *HealthService) Status() string {
	return "ok"
}
