'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';

const steps = [
  { id: 1, name: 'Contato' },
  { id: 2, name: 'Veículo' },
  { id: 3, name: 'Problema' },
  { id: 4, name: 'Serviços' },
  { id: 5, name: 'Resumo' },
];

const categories = [
  { id: 'revisao', name: 'Revisão', icon: '🔧' },
  { id: 'freios', name: 'Freios', icon: '🛞' },
  { id: 'suspensao', name: 'Suspensão', icon: '🚗' },
  { id: 'motor', name: 'Motor', icon: '⚙️' },
  { id: 'eletrica', name: 'Elétrica', icon: '⚡' },
  { id: 'ar', name: 'Ar Condicionado', icon: '❄️' },
  { id: 'diagnostico', name: 'Diagnóstico', icon: '🔍' },
];

export default function QuotePage({ params }: { params: { tenantSlug: string } }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    plate: '',
    brand: '',
    model: '',
    year: '',
    mileage: '',
    category: '',
    description: '',
    selectedServices: [] as string[],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    // TODO: Submit to API
    alert('Orçamento enviado com sucesso! Entraremos em contato em breve.');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep > step.id
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step.id
                      ? 'border-primary text-primary'
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            {steps.map((step) => (
              <span key={step.id} className="w-12 text-center">{step.name}</span>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].name}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Step 1: Contact */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Seu nome" />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone (WhatsApp) *</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(11) 99999-9999" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" />
                </div>
              </div>
            )}

            {/* Step 2: Vehicle */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="plate">Placa do veículo *</Label>
                  <Input id="plate" name="plate" value={formData.plate} onChange={handleChange} placeholder="ABC1D23" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand">Marca</Label>
                    <Input id="brand" name="brand" value={formData.brand} onChange={handleChange} placeholder="Ex: Honda" />
                  </div>
                  <div>
                    <Label htmlFor="model">Modelo</Label>
                    <Input id="model" name="model" value={formData.model} onChange={handleChange} placeholder="Ex: Civic" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Ano</Label>
                    <Input id="year" name="year" value={formData.year} onChange={handleChange} placeholder="2022" />
                  </div>
                  <div>
                    <Label htmlFor="mileage">Km atual</Label>
                    <Input id="mileage" name="mileage" value={formData.mileage} onChange={handleChange} placeholder="35000" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Category */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Selecione a categoria do problema:</p>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-4 border rounded-lg text-left transition ${
                        formData.category === cat.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-gray-400'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <p className="font-medium mt-2">{cat.name}</p>
                    </button>
                  ))}
                </div>
                <div>
                  <Label htmlFor="description">Descreva o problema (opcional)</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full mt-1 p-3 border rounded-lg"
                    rows={3}
                    placeholder="Ex: Freio fazendo barulho ao pisar..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Services */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Selecione os serviços de interesse:</p>
                <div className="space-y-2">
                  {[
                    { id: '1', name: 'Troca de óleo e filtro', price: 150 },
                    { id: '2', name: 'Revisão preventiva', price: 250 },
                    { id: '3', name: 'Diagnóstico eletrônico', price: 80 },
                    { id: '4', name: 'Alinhamento e balanceamento', price: 120 },
                  ].map((service) => (
                    <label
                      key={service.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                        formData.selectedServices.includes(service.id)
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.selectedServices.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                selectedServices: [...formData.selectedServices, service.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                selectedServices: formData.selectedServices.filter((s) => s !== service.id),
                              });
                            }
                          }}
                          className="mr-3"
                        />
                        <span>{service.name}</span>
                      </div>
                      <span className="font-medium">R$ {service.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Summary */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Seus dados</h4>
                  <p className="text-sm text-gray-600">{formData.name}</p>
                  <p className="text-sm text-gray-600">{formData.phone}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Veículo</h4>
                  <p className="text-sm text-gray-600">
                    {formData.plate} - {formData.brand} {formData.model}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Serviços selecionados</h4>
                  <p className="text-sm text-gray-600">
                    {formData.selectedServices.length} serviço(s)
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h4 className="font-medium">Estimativa</h4>
                  <p className="text-2xl font-bold text-primary mt-1">R$ 600,00</p>
                  <p className="text-xs text-gray-500 mt-1">*Valor estimado, sujeito a avaliação</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              ) : (
                <div />
              )}
              {currentStep < 5 ? (
                <Button onClick={nextStep}>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Enviar Orçamento
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          Powered by OficinaOS
        </p>
      </div>
    </div>
  );
}
