'use client';

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
  Spinner,
  Switch,
} from '@lastro-co/design-system';
import {
  CheckIconCircle,
  HouseIcon,
  MailIcon,
  SearchIcon,
  SparklesIcon,
  StarIcon,
} from '@lastro-co/design-system/icons';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl space-y-10 px-6">
        <header className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="font-bold font-display text-5xl text-gray-900">
              Next.js Starter
            </h1>
            <p className="text-gray-600 text-lg">
              Your application is ready. Start building!
            </p>
          </div>
        </header>

        <div className="rounded-lg border border-purple-300 bg-purple-300/20 p-4 text-center">
          <p className="text-purple-900 text-sm">
            Os componentes abaixo fazem parte do{' '}
            <strong>Lastro Design System</strong>. <br />
            Esta página serve como demonstração dos componentes, icons e tokens
            disponíveis na biblioteca.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-purple-300 px-4 py-1.5">
          <SparklesIcon className="text-purple-800" size="sm" />
          <span className="font-medium text-purple-800 text-sm">
            Powered by @lastro-co/design-system
          </span>
        </div>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button color="purple" variant="contained">
              <SparklesIcon size="sm" />
              Contained
            </Button>
            <Button color="purple" variant="outlined">
              Outlined
            </Button>
            <Button color="black" variant="contained">
              Black
            </Button>
            <Button color="error" variant="outlined">
              Error
            </Button>
            <Button color="purple" size="small" variant="contained">
              Small
            </Button>
            <Button color="purple" shape="pill" variant="contained">
              Pill
            </Button>
            <Button color="purple" loading variant="contained">
              Loading
            </Button>
            <Button color="purple" disabled variant="contained">
              Disabled
            </Button>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges">
          <div className="flex flex-wrap items-center gap-3">
            <Badge color="purple">Purple</Badge>
            <Badge color="blue">Blue</Badge>
            <Badge color="green">Green</Badge>
            <Badge color="orange">Orange</Badge>
            <Badge color="red">Red</Badge>
            <Badge color="yellow">Yellow</Badge>
            <Badge color="gray">Gray</Badge>
            <Badge color="purple" showDot>
              Com dot
            </Badge>
            <Badge color="blue" isNumber>
              42
            </Badge>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  <HouseIcon
                    className="mr-2 inline text-purple-600"
                    size="md"
                  />
                  Imóvel Destaque
                </CardTitle>
                <CardDescription>
                  Apartamento 3 quartos no centro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Apartamento amplo com vista para o parque, 120m², 2 vagas de
                  garagem.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <span className="font-semibold text-purple-800">
                  R$ 450.000
                </span>
                <Button color="purple" size="small" variant="outlined">
                  Ver detalhes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <StarIcon className="mr-2 inline text-yellow-600" size="md" />
                  Lead Qualificado
                </CardTitle>
                <CardDescription>Novo lead via WhatsApp</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MailIcon className="text-gray-600" size="sm" />
                    <span className="text-sm">joao@email.com</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge color="green" size="small">
                      Qualificado
                    </Badge>
                    <Badge color="purple" size="small">
                      Compra
                    </Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  color="purple"
                  size="small"
                  variant="contained"
                >
                  Entrar em contato
                </Button>
              </CardFooter>
            </Card>
          </div>
        </Section>

        {/* Alerts */}
        <Section title="Alerts">
          <div className="space-y-3">
            <Alert severity="success">
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>Lead cadastrado com sucesso.</AlertDescription>
            </Alert>
            <Alert severity="info">
              <AlertTitle>Informação</AlertTitle>
              <AlertDescription>
                Existem 5 leads aguardando atendimento.
              </AlertDescription>
            </Alert>
            <Alert severity="warning">
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>Seu plano expira em 3 dias.</AlertDescription>
            </Alert>
            <Alert severity="error">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>
                Falha ao sincronizar com o portal.
              </AlertDescription>
            </Alert>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Buscar imóvel..." />
            <Input placeholder="Email do lead" type="email" />
          </div>
        </Section>

        {/* Icons */}
        <Section title="Icons">
          <div className="flex flex-wrap items-center gap-4">
            <IconDemo icon={<HouseIcon size="lg" />} label="House" />
            <IconDemo icon={<SearchIcon size="lg" />} label="Search" />
            <IconDemo icon={<MailIcon size="lg" />} label="Mail" />
            <IconDemo icon={<StarIcon size="lg" />} label="Star" />
            <IconDemo icon={<SparklesIcon size="lg" />} label="Sparkles" />
            <IconDemo icon={<CheckIconCircle size="lg" />} label="Check" />
          </div>
        </Section>

        {/* Misc */}
        <Section title="Outros">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Spinner className="text-purple-600" />
              <span className="text-sm">Spinner</span>
            </div>
            <div className="flex items-center gap-2">
              <Switch />
              <span className="text-sm">Switch</span>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="font-display font-semibold text-2xl text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function IconDemo({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-gray-700">
      {icon}
      <span className="text-xs">{label}</span>
    </div>
  );
}
