import { PrismaClient, UserRole, Plan, FuelType, TransmissionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Demo Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'oficina-demo' },
    update: {},
    create: {
      name: 'Oficina Demo',
      slug: 'oficina-demo',
      plan: Plan.PROFESSIONAL,
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
      },
    },
  });
  console.log('✅ Tenant created:', tenant.name);

  // Create Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oficina-demo.com' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@oficina-demo.com',
      name: 'Administrador',
      role: UserRole.OWNER,
      passwordHash,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Super Admin (tenant_id = null)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@oficina-os.com' },
    update: {},
    create: {
      tenantId: null,
      email: 'superadmin@oficina-os.com',
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      passwordHash,
    },
  });
  console.log('✅ Super Admin created:', superAdmin.email);

  // Create CRM Stages (Default Pipeline)
  const stagesData = [
    { name: 'Novos Leads', position: 1, color: '#6B7280', slaHours: 24 },
    { name: 'Em Triagem', position: 2, color: '#3B82F6', slaHours: 4 },
    { name: 'Orçamento em Elaboração', position: 3, color: '#8B5CF6', slaHours: 8 },
    { name: 'Orçamento Enviado', position: 4, color: '#F59E0B', slaHours: 48 },
    { name: 'Aguardando Aprovação', position: 5, color: '#F97316', slaHours: 72 },
    { name: 'Aprovado', position: 6, color: '#10B981', slaHours: null },
    { name: 'Em Execução (OS)', position: 7, color: '#06B6D4', slaHours: null },
    { name: 'Finalizado', position: 8, color: '#22C55E', isFinal: true },
    { name: 'Perdido', position: 9, color: '#EF4444', isFinal: true, isLost: true },
    { name: 'Follow-up', position: 10, color: '#EC4899', slaHours: 168 },
  ];

  for (const stageData of stagesData) {
    await prisma.crmStage.upsert({
      where: {
        tenantId_position: {
          tenantId: tenant.id,
          position: stageData.position,
        },
      },
      update: stageData,
      create: {
        tenantId: tenant.id,
        ...stageData,
      },
    });
  }
  console.log('✅ CRM Stages created');

  // Create Labor Rates
  const laborRates = [
    { name: 'Padrão', category: 'geral', ratePerHour: 120, isDefault: true },
    { name: 'Motor', category: 'motor', ratePerHour: 150 },
    { name: 'Elétrica', category: 'eletrica', ratePerHour: 140 },
    { name: 'Ar Condicionado', category: 'ar', ratePerHour: 130 },
    { name: 'Suspensão', category: 'suspensao', ratePerHour: 120 },
    { name: 'Freios', category: 'freios', ratePerHour: 110 },
  ];

  const createdLaborRates: Record<string, string> = {};
  for (const rate of laborRates) {
    const created = await prisma.laborRate.create({
      data: {
        tenantId: tenant.id,
        ...rate,
      },
    });
    createdLaborRates[rate.category] = created.id;
  }
  console.log('✅ Labor rates created');

  // Create Suppliers
  const suppliers = [
    { name: 'Auto Peças Central', phone: '(11) 3333-4444', email: 'vendas@autopecascentral.com' },
    { name: 'Distribuidora Mecânica', phone: '(11) 2222-5555', email: 'contato@distmec.com' },
  ];

  const createdSuppliers: Record<string, string> = {};
  for (const supplier of suppliers) {
    const created = await prisma.supplier.create({
      data: {
        tenantId: tenant.id,
        ...supplier,
      },
    });
    createdSuppliers[supplier.name] = created.id;
  }
  console.log('✅ Suppliers created');

  // Create Catalog Parts
  const parts = [
    { code: 'OLEO5W30', name: 'Óleo Motor 5W30 Sintético (L)', category: 'Lubrificantes', unit: 'L', costAvg: 35, suggestedPrice: 55, markupDefault: 57 },
    { code: 'FILTRO01', name: 'Filtro de Óleo Universal', category: 'Filtros', unit: 'UN', costAvg: 25, suggestedPrice: 45, markupDefault: 80 },
    { code: 'FILTRO02', name: 'Filtro de Ar Motor', category: 'Filtros', unit: 'UN', costAvg: 40, suggestedPrice: 70, markupDefault: 75 },
    { code: 'FILTRO03', name: 'Filtro de Combustível', category: 'Filtros', unit: 'UN', costAvg: 55, suggestedPrice: 95, markupDefault: 73 },
    { code: 'PAST001', name: 'Pastilha de Freio Dianteira', category: 'Freios', unit: 'JG', costAvg: 120, suggestedPrice: 200, markupDefault: 67 },
    { code: 'DISC001', name: 'Disco de Freio Dianteiro', category: 'Freios', unit: 'UN', costAvg: 180, suggestedPrice: 300, markupDefault: 67 },
    { code: 'AMORT01', name: 'Amortecedor Dianteiro', category: 'Suspensão', unit: 'UN', costAvg: 250, suggestedPrice: 420, markupDefault: 68 },
    { code: 'VELA001', name: 'Vela de Ignição (Jogo 4)', category: 'Ignição', unit: 'JG', costAvg: 80, suggestedPrice: 140, markupDefault: 75 },
    { code: 'CORR001', name: 'Correia Dentada', category: 'Motor', unit: 'UN', costAvg: 150, suggestedPrice: 280, markupDefault: 87 },
    { code: 'BOMB001', name: 'Bomba d\'Água', category: 'Arrefecimento', unit: 'UN', costAvg: 200, suggestedPrice: 350, markupDefault: 75 },
  ];

  for (const part of parts) {
    await prisma.catalogPart.create({
      data: {
        tenantId: tenant.id,
        supplierId: createdSuppliers['Auto Peças Central'],
        stockQty: Math.floor(Math.random() * 20) + 5,
        ...part,
      },
    });
  }
  console.log('✅ Catalog parts created');

  // Create Catalog Services
  const services = [
    {
      code: 'TROCA_OLEO',
      name: 'Troca de Óleo e Filtro',
      category: 'Revisão',
      defaultTimeHrs: 0.5,
      suggestedPrice: 80,
      description: 'Troca de óleo do motor e filtro de óleo. Inclui verificação de níveis.',
      checklist: ['Drenar óleo usado', 'Substituir filtro', 'Adicionar óleo novo', 'Verificar vazamentos', 'Resetar indicador'],
    },
    {
      code: 'REVISAO_10K',
      name: 'Revisão 10.000 km',
      category: 'Revisão',
      defaultTimeHrs: 2,
      suggestedPrice: 250,
      description: 'Revisão completa de 10.000 km com troca de filtros e verificações.',
    },
    {
      code: 'ALINHA_BAL',
      name: 'Alinhamento e Balanceamento',
      category: 'Suspensão',
      defaultTimeHrs: 1,
      suggestedPrice: 120,
    },
    {
      code: 'TROCA_PAST',
      name: 'Troca de Pastilhas de Freio',
      category: 'Freios',
      defaultTimeHrs: 1.5,
      suggestedPrice: 100,
    },
    {
      code: 'TROCA_DISCO',
      name: 'Troca de Discos e Pastilhas',
      category: 'Freios',
      defaultTimeHrs: 2.5,
      suggestedPrice: 180,
    },
    {
      code: 'DIAG_ELET',
      name: 'Diagnóstico Eletrônico',
      category: 'Diagnóstico',
      defaultTimeHrs: 0.5,
      suggestedPrice: 80,
    },
    {
      code: 'MANUT_AR',
      name: 'Manutenção Ar Condicionado',
      category: 'Ar Condicionado',
      defaultTimeHrs: 1.5,
      suggestedPrice: 150,
    },
    {
      code: 'TROCA_CORR',
      name: 'Troca de Correia Dentada',
      category: 'Motor',
      defaultTimeHrs: 4,
      suggestedPrice: 350,
    },
    {
      code: 'TROCA_AMORT',
      name: 'Troca de Amortecedores (Par)',
      category: 'Suspensão',
      defaultTimeHrs: 2,
      suggestedPrice: 200,
    },
    {
      code: 'HIGIENIZ',
      name: 'Higienização de Ar Condicionado',
      category: 'Ar Condicionado',
      defaultTimeHrs: 0.5,
      suggestedPrice: 60,
    },
  ];

  for (const service of services) {
    const laborRateId = service.category === 'Motor' ? createdLaborRates['motor']
      : service.category === 'Freios' ? createdLaborRates['freios']
      : service.category === 'Suspensão' ? createdLaborRates['suspensao']
      : service.category === 'Ar Condicionado' ? createdLaborRates['ar']
      : createdLaborRates['geral'];

    await prisma.catalogService.create({
      data: {
        tenantId: tenant.id,
        laborRateId,
        ...service,
        checklist: service.checklist ? JSON.stringify(service.checklist) : null,
      },
    });
  }
  console.log('✅ Catalog services created');

  // Create Consumables
  const consumables = [
    { code: 'LIMP001', name: 'Limpa Contato', unit: 'UN', costAvg: 15, suggestedPrice: 25 },
    { code: 'GRAXA01', name: 'Graxa para Rolamentos', unit: 'KG', costAvg: 30, suggestedPrice: 50 },
    { code: 'FLUID01', name: 'Fluido de Freio DOT4', unit: 'L', costAvg: 40, suggestedPrice: 70 },
    { code: 'REFRI01', name: 'Aditivo Radiador', unit: 'L', costAvg: 25, suggestedPrice: 45 },
  ];

  for (const consumable of consumables) {
    await prisma.catalogConsumable.create({
      data: {
        tenantId: tenant.id,
        stockQty: Math.floor(Math.random() * 10) + 2,
        ...consumable,
      },
    });
  }
  console.log('✅ Consumables created');

  // Create Sample Customers
  const customers = [
    {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-1111',
      document: '123.456.789-00',
      source: 'Indicação',
    },
    {
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '(11) 99999-2222',
      document: '987.654.321-00',
      source: 'Google',
    },
    {
      name: 'Pedro Oliveira',
      email: 'pedro@email.com',
      phone: '(11) 99999-3333',
      document: '456.789.123-00',
      source: 'Instagram',
    },
  ];

  const createdCustomers: Record<string, string> = {};
  for (const customer of customers) {
    const created = await prisma.customer.create({
      data: {
        tenantId: tenant.id,
        ...customer,
      },
    });
    createdCustomers[customer.name] = created.id;
  }
  console.log('✅ Sample customers created');

  // Create Sample Vehicles
  const vehicles = [
    {
      customerId: createdCustomers['João Silva'],
      plate: 'ABC1D23',
      brand: 'Honda',
      model: 'Civic',
      version: 'EXL',
      year: 2022,
      engine: '2.0',
      mileage: 35000,
      fuelType: FuelType.FLEX,
      transmission: TransmissionType.CVT,
      color: 'Prata',
    },
    {
      customerId: createdCustomers['Maria Santos'],
      plate: 'XYZ9E87',
      brand: 'Toyota',
      model: 'Corolla',
      version: 'XEI',
      year: 2021,
      engine: '2.0',
      mileage: 42000,
      fuelType: FuelType.FLEX,
      transmission: TransmissionType.CVT,
      color: 'Branco',
    },
    {
      customerId: createdCustomers['Pedro Oliveira'],
      plate: 'QWE5R67',
      brand: 'Volkswagen',
      model: 'Golf',
      version: 'GTI',
      year: 2020,
      engine: '2.0 TSI',
      mileage: 55000,
      fuelType: FuelType.GASOLINE,
      transmission: TransmissionType.AUTOMATED,
      color: 'Preto',
    },
  ];

  for (const vehicle of vehicles) {
    await prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        ...vehicle,
      },
    });
  }
  console.log('✅ Sample vehicles created');

  // Create Proposal Template
  await prisma.proposalTemplate.create({
    data: {
      tenantId: tenant.id,
      name: 'Clássico',
      isDefault: true,
      template: {
        layout: 'classic',
        showLogo: true,
        showTerms: true,
        showWarranty: true,
        showPaymentTerms: true,
        primaryColor: '#3B82F6',
        footerText: 'Obrigado pela preferência!',
      },
    },
  });
  console.log('✅ Proposal template created');

  // Create Public Page Config
  await prisma.publicPageConfig.create({
    data: {
      tenantId: tenant.id,
      template: 'modern',
      heroTitle: 'Sua oficina de confiança',
      heroSubtitle: 'Profissionais qualificados e peças de qualidade',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      ctaText: 'Solicitar Orçamento',
      sections: [
        { type: 'services', title: 'Nossos Serviços', visible: true },
        { type: 'about', title: 'Sobre Nós', visible: true },
        { type: 'testimonials', title: 'Depoimentos', visible: false },
      ],
      socialLinks: {
        instagram: '',
        whatsapp: '',
        facebook: '',
      },
      isPublished: true,
    },
  });
  console.log('✅ Public page config created');

  // Create Follow-up Rules
  const followUpRules = [
    {
      trigger: 'QUOTE_ABANDONED' as const,
      delayHours: 1,
      channel: 'WHATSAPP' as const,
      messageTemplate: 'Olá {cliente}! Notamos que você não concluiu seu orçamento. Posso ajudar?',
    },
    {
      trigger: 'QUOTE_SENT' as const,
      delayHours: 24,
      channel: 'EMAIL' as const,
      messageTemplate: 'Olá {cliente}! Enviamos seu orçamento. Ficou alguma dúvida?',
    },
    {
      trigger: 'QUOTE_SENT' as const,
      delayHours: 72,
      channel: 'WHATSAPP' as const,
      messageTemplate: 'Olá {cliente}! Seu orçamento ainda está válido. Podemos agendar o serviço?',
    },
  ];

  for (const rule of followUpRules) {
    await prisma.followUpRule.create({
      data: {
        tenantId: tenant.id,
        ...rule,
      },
    });
  }
  console.log('✅ Follow-up rules created');

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📧 Login credentials:');
  console.log('   Admin: admin@oficina-demo.com / admin123');
  console.log('   Super Admin: superadmin@oficina-os.com / admin123');
  console.log('');
  console.log('🌐 Tenant slug: oficina-demo');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
