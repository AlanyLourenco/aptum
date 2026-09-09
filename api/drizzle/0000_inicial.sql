CREATE TYPE "public"."categoria" AS ENUM('skincare', 'maquiagem', 'cabelo', 'perfumaria', 'corpo');--> statement-breakpoint
CREATE TYPE "public"."estado_cupom" AS ENUM('confirmado', 'provavel', 'nao_vale');--> statement-breakpoint
CREATE TYPE "public"."origem" AS ENUM('feed_afiliado', 'api_oficial', 'endpoint_publico', 'html', 'terceiro', 'usuaria');--> statement-breakpoint
CREATE TYPE "public"."tipo_lista" AS ENUM('reposicao', 'desejo');--> statement-breakpoint
CREATE TYPE "public"."tipo_regra" AS ENUM('categoria_inclui', 'categoria_exclui', 'marca_inclui', 'marca_exclui', 'valor_minimo', 'primeira_compra', 'teto_desconto');--> statement-breakpoint
CREATE TYPE "public"."tipo_seller" AS ENUM('oficial', 'autorizado', 'terceiro');--> statement-breakpoint
CREATE TYPE "public"."unidade" AS ENUM('ml', 'g', 'un');--> statement-breakpoint
CREATE TABLE "agregado_diario" (
	"variante_id" uuid NOT NULL,
	"loja_id" uuid NOT NULL,
	"dia" date NOT NULL,
	"p10_90d" integer NOT NULL,
	"mediana_90d" integer NOT NULL,
	"pico_90d" integer NOT NULL,
	"trocas_90d" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuaria_id" uuid NOT NULL,
	"variante_id" uuid,
	"cupom_id" uuid,
	"gatilho" text NOT NULL,
	"justificativa" jsonb NOT NULL,
	"enviado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"aberto_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "cupom" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"codigo" text NOT NULL,
	"chamada" text NOT NULL,
	"desconto_pct" smallint,
	"desconto_valor" integer,
	"vigencia_inicio" timestamp with time zone,
	"vigencia_fim" timestamp with time zone,
	"estado" "estado_cupom" DEFAULT 'provavel' NOT NULL,
	"motivo" text,
	"regulamento_bruto" text,
	"revisado_por" text,
	"revisado_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "item_lista" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lista_id" uuid NOT NULL,
	"variante_id" uuid NOT NULL,
	"ciclo_dias" smallint,
	"ultima_compra_em" date,
	"preco_alvo" integer,
	"tons_aceitos" jsonb,
	"pausado" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "janela_preco" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variante_id" uuid NOT NULL,
	"loja_id" uuid NOT NULL,
	"preco" integer NOT NULL,
	"inicio" timestamp with time zone NOT NULL,
	"fim" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lista" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuaria_id" uuid NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_lista" NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loja" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"nome" text NOT NULL,
	"degrau_acesso" smallint NOT NULL,
	"req_por_segundo" integer DEFAULT 1 NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL,
	"motivo_inativa" text,
	CONSTRAINT "loja_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "observacao_preco" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variante_id" uuid NOT NULL,
	"loja_id" uuid NOT NULL,
	"seller_id" uuid,
	"preco" integer NOT NULL,
	"preco_de" integer,
	"disponivel" boolean NOT NULL,
	"peu" integer NOT NULL,
	"origem" "origem" NOT NULL,
	"confianca" smallint NOT NULL,
	"coletado_em" timestamp with time zone NOT NULL,
	"visto_em" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "produto" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"marca" text NOT NULL,
	"nome" text NOT NULL,
	"categoria" "categoria" NOT NULL,
	"ean" text,
	"refil_de" uuid,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regra_cupom" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cupom_id" uuid NOT NULL,
	"tipo" "tipo_regra" NOT NULL,
	"valor" text,
	"valor_numerico" integer,
	"trecho_origem" text
);
--> statement-breakpoint
CREATE TABLE "rejeicao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"variante_id" uuid,
	"portao" text NOT NULL,
	"motivo" text NOT NULL,
	"carga_bruta" jsonb,
	"ocorrido_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seller" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"id_externo" text NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tipo_seller" DEFAULT 'terceiro' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarefa_coleta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loja_id" uuid NOT NULL,
	"variante_id" uuid NOT NULL,
	"faixa" smallint NOT NULL,
	"agendada_para" timestamp with time zone NOT NULL,
	"pega_em" timestamp with time zone,
	"tentativas" smallint DEFAULT 0 NOT NULL,
	"ultimo_erro" text
);
--> statement-breakpoint
CREATE TABLE "usuaria" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"avisos" jsonb NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "variante" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"produto_id" uuid NOT NULL,
	"codigo_tom" text,
	"nome_tom" text,
	"amostra" text,
	"ean" text,
	"conteudo" integer NOT NULL,
	"unidade" "unidade" NOT NULL,
	"pecas" smallint DEFAULT 1 NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agregado_diario" ADD CONSTRAINT "agregado_diario_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agregado_diario" ADD CONSTRAINT "agregado_diario_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_usuaria_id_usuaria_id_fk" FOREIGN KEY ("usuaria_id") REFERENCES "public"."usuaria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerta" ADD CONSTRAINT "alerta_cupom_id_cupom_id_fk" FOREIGN KEY ("cupom_id") REFERENCES "public"."cupom"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cupom" ADD CONSTRAINT "cupom_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_lista" ADD CONSTRAINT "item_lista_lista_id_lista_id_fk" FOREIGN KEY ("lista_id") REFERENCES "public"."lista"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_lista" ADD CONSTRAINT "item_lista_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "janela_preco" ADD CONSTRAINT "janela_preco_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "janela_preco" ADD CONSTRAINT "janela_preco_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lista" ADD CONSTRAINT "lista_usuaria_id_usuaria_id_fk" FOREIGN KEY ("usuaria_id") REFERENCES "public"."usuaria"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observacao_preco" ADD CONSTRAINT "observacao_preco_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observacao_preco" ADD CONSTRAINT "observacao_preco_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observacao_preco" ADD CONSTRAINT "observacao_preco_seller_id_seller_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."seller"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regra_cupom" ADD CONSTRAINT "regra_cupom_cupom_id_cupom_id_fk" FOREIGN KEY ("cupom_id") REFERENCES "public"."cupom"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rejeicao" ADD CONSTRAINT "rejeicao_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rejeicao" ADD CONSTRAINT "rejeicao_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seller" ADD CONSTRAINT "seller_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefa_coleta" ADD CONSTRAINT "tarefa_coleta_loja_id_loja_id_fk" FOREIGN KEY ("loja_id") REFERENCES "public"."loja"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarefa_coleta" ADD CONSTRAINT "tarefa_coleta_variante_id_variante_id_fk" FOREIGN KEY ("variante_id") REFERENCES "public"."variante"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variante" ADD CONSTRAINT "variante_produto_id_produto_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."produto"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "agregado_pk" ON "agregado_diario" USING btree ("variante_id","loja_id","dia");--> statement-breakpoint
CREATE INDEX "alerta_usuaria_tempo_idx" ON "alerta" USING btree ("usuaria_id","enviado_em" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "cupom_loja_codigo_idx" ON "cupom" USING btree ("loja_id","codigo");--> statement-breakpoint
CREATE INDEX "cupom_vigencia_idx" ON "cupom" USING btree ("loja_id","vigencia_fim");--> statement-breakpoint
CREATE UNIQUE INDEX "item_lista_variante_idx" ON "item_lista" USING btree ("lista_id","variante_id");--> statement-breakpoint
CREATE INDEX "item_variante_idx" ON "item_lista" USING btree ("variante_id");--> statement-breakpoint
CREATE INDEX "janela_variante_periodo_idx" ON "janela_preco" USING btree ("variante_id","inicio","fim");--> statement-breakpoint
CREATE INDEX "lista_usuaria_idx" ON "lista" USING btree ("usuaria_id");--> statement-breakpoint
CREATE INDEX "obs_variante_loja_tempo_idx" ON "observacao_preco" USING btree ("variante_id","loja_id","coletado_em" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "produto_marca_idx" ON "produto" USING btree ("marca");--> statement-breakpoint
CREATE UNIQUE INDEX "produto_ean_idx" ON "produto" USING btree ("ean");--> statement-breakpoint
CREATE INDEX "regra_cupom_idx" ON "regra_cupom" USING btree ("cupom_id");--> statement-breakpoint
CREATE INDEX "rejeicao_loja_tempo_idx" ON "rejeicao" USING btree ("loja_id","ocorrido_em" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "seller_loja_externo_idx" ON "seller" USING btree ("loja_id","id_externo");--> statement-breakpoint
CREATE INDEX "tarefa_fila_idx" ON "tarefa_coleta" USING btree ("loja_id","agendada_para","pega_em");--> statement-breakpoint
CREATE INDEX "variante_produto_idx" ON "variante" USING btree ("produto_id");--> statement-breakpoint
CREATE UNIQUE INDEX "variante_ean_idx" ON "variante" USING btree ("ean");