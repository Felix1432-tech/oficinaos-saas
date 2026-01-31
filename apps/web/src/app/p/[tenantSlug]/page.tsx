import { notFound } from 'next/navigation';

interface Props {
  params: { tenantSlug: string };
}

async function getTenantConfig(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/public/${slug}/config`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PublicLandingPage({ params }: Props) {
  const data = await getTenantConfig(params.tenantSlug);

  if (!data) {
    notFound();
  }

  const { tenant, config } = data;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="relative py-24 px-4"
        style={{
          backgroundColor: config?.primaryColor || '#3B82F6',
        }}
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {config?.heroTitle || tenant.name}
          </h1>
          <p className="text-xl opacity-90 mb-8">
            {config?.heroSubtitle || 'Sua oficina de confiança'}
          </p>
          <a
            href={`/p/${params.tenantSlug}/orcamento`}
            className="inline-block bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            {config?.ctaText || 'Solicitar Orçamento'}
          </a>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Serviços</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Troca de Óleo', desc: 'Óleo e filtros de qualidade', price: 'A partir de R$ 150' },
              { name: 'Revisão Completa', desc: 'Revisão preventiva', price: 'A partir de R$ 250' },
              { name: 'Freios', desc: 'Pastilhas e discos', price: 'A partir de R$ 200' },
              { name: 'Suspensão', desc: 'Amortecedores e molas', price: 'A partir de R$ 400' },
              { name: 'Ar Condicionado', desc: 'Manutenção e higienização', price: 'A partir de R$ 150' },
              { name: 'Diagnóstico', desc: 'Scanner eletrônico', price: 'A partir de R$ 80' },
            ].map((service) => (
              <div
                key={service.name}
                className="p-6 border rounded-lg hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-3">{service.desc}</p>
                <p className="text-primary font-bold">{service.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Precisa de um orçamento?</h2>
          <p className="text-gray-600 mb-6">
            Responda algumas perguntas rápidas e receba uma estimativa em minutos
          </p>
          <a
            href={`/p/${params.tenantSlug}/orcamento`}
            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
          >
            Fazer Orçamento Online
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {tenant.name}. Todos os direitos reservados.</p>
          <p className="mt-2">Powered by OficinaOS</p>
        </div>
      </footer>
    </div>
  );
}
