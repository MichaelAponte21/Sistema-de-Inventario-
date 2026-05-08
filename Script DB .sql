-- ============================================================
-- Script de Base de Datos - Sistema de Inventario
-- Compatible con PostgreSQL 14+
-- Importar en DBeaver: click derecho en la BD → Execute SQL Script
-- ============================================================

-- Limpiar tablas si ya existen (orden inverso por FK)
DROP TABLE IF EXISTS public.detalle_venta CASCADE;
DROP TABLE IF EXISTS public.venta CASCADE;
DROP TABLE IF EXISTS public.arqueo_caja CASCADE;
DROP TABLE IF EXISTS public.movimiento_inventario CASCADE;
DROP TABLE IF EXISTS public.producto CASCADE;
DROP TABLE IF EXISTS public.categoria CASCADE;
DROP TABLE IF EXISTS public.usuario CASCADE;
DROP TABLE IF EXISTS public.rol CASCADE;

-- Limpiar secuencias
DROP SEQUENCE IF EXISTS public.arqueo_caja_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.categoria_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.detalle_venta_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.movimiento_inventario_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.producto_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.rol_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.usuario_id_seq CASCADE;
DROP SEQUENCE IF EXISTS public.venta_id_seq CASCADE;

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE public.rol (
    id bigint NOT NULL,
    nombre character varying(50) NOT NULL
);

CREATE SEQUENCE public.rol_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.rol_id_seq OWNED BY public.rol.id;
ALTER TABLE ONLY public.rol ALTER COLUMN id SET DEFAULT nextval('public.rol_id_seq'::regclass);
ALTER TABLE ONLY public.rol ADD CONSTRAINT rol_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.rol ADD CONSTRAINT rol_nombre_key UNIQUE (nombre);

-- ============================================================

CREATE TABLE public.usuario (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rol_id bigint NOT NULL
);

CREATE SEQUENCE public.usuario_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.usuario_id_seq OWNED BY public.usuario.id;
ALTER TABLE ONLY public.usuario ALTER COLUMN id SET DEFAULT nextval('public.usuario_id_seq'::regclass);
ALTER TABLE ONLY public.usuario ADD CONSTRAINT usuario_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.usuario ADD CONSTRAINT usuario_email_key UNIQUE (email);
ALTER TABLE ONLY public.usuario ADD CONSTRAINT usuario_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.rol(id);

-- ============================================================

CREATE TABLE public.categoria (
    id bigint NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(255)
);

CREATE SEQUENCE public.categoria_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.categoria_id_seq OWNED BY public.categoria.id;
ALTER TABLE ONLY public.categoria ALTER COLUMN id SET DEFAULT nextval('public.categoria_id_seq'::regclass);
ALTER TABLE ONLY public.categoria ADD CONSTRAINT categoria_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categoria ADD CONSTRAINT categoria_nombre_key UNIQUE (nombre);

-- ============================================================

CREATE TABLE public.producto (
    id bigint NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion character varying(500),
    precio numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    stock_minimo integer DEFAULT 0 NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion timestamp without time zone,
    categoria_id bigint NOT NULL,
    CONSTRAINT producto_precio_check CHECK ((precio >= (0)::numeric)),
    CONSTRAINT producto_stock_check CHECK ((stock >= 0)),
    CONSTRAINT producto_stock_minimo_check CHECK ((stock_minimo >= 0))
);

CREATE SEQUENCE public.producto_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.producto_id_seq OWNED BY public.producto.id;
ALTER TABLE ONLY public.producto ALTER COLUMN id SET DEFAULT nextval('public.producto_id_seq'::regclass);
ALTER TABLE ONLY public.producto ADD CONSTRAINT producto_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.producto ADD CONSTRAINT producto_categoria_id_fkey FOREIGN KEY (categoria_id) REFERENCES public.categoria(id);

-- ============================================================

CREATE TABLE public.movimiento_inventario (
    id bigint NOT NULL,
    tipo character varying(10) NOT NULL,
    cantidad integer NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    observacion character varying(500),
    producto_id bigint NOT NULL,
    usuario_id bigint NOT NULL,
    CONSTRAINT movimiento_inventario_cantidad_check CHECK ((cantidad > 0)),
    CONSTRAINT movimiento_inventario_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['ENTRADA'::character varying, 'SALIDA'::character varying])::text[])))
);

CREATE SEQUENCE public.movimiento_inventario_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.movimiento_inventario_id_seq OWNED BY public.movimiento_inventario.id;
ALTER TABLE ONLY public.movimiento_inventario ALTER COLUMN id SET DEFAULT nextval('public.movimiento_inventario_id_seq'::regclass);
ALTER TABLE ONLY public.movimiento_inventario ADD CONSTRAINT movimiento_inventario_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.movimiento_inventario ADD CONSTRAINT movimiento_inventario_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.producto(id);
ALTER TABLE ONLY public.movimiento_inventario ADD CONSTRAINT movimiento_inventario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuario(id);

-- ============================================================

CREATE TABLE public.arqueo_caja (
    id bigint NOT NULL,
    fecha_apertura timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre timestamp with time zone,
    monto_inicial numeric(12,2) DEFAULT 0 NOT NULL,
    monto_ventas_efectivo numeric(12,2) DEFAULT 0,
    monto_final_esperado numeric(12,2) DEFAULT 0,
    monto_final_real numeric(12,2),
    diferencia numeric(12,2),
    observaciones text,
    abierto boolean DEFAULT true,
    usuario_id bigint NOT NULL
);

CREATE SEQUENCE public.arqueo_caja_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.arqueo_caja_id_seq OWNED BY public.arqueo_caja.id;
ALTER TABLE ONLY public.arqueo_caja ALTER COLUMN id SET DEFAULT nextval('public.arqueo_caja_id_seq'::regclass);
ALTER TABLE ONLY public.arqueo_caja ADD CONSTRAINT arqueo_caja_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.arqueo_caja ADD CONSTRAINT fk_arqueo_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX uniq_arqueo_abierto_por_usuario ON public.arqueo_caja (usuario_id) WHERE abierto = true;

-- ============================================================

CREATE TABLE public.venta (
    id bigint NOT NULL,
    fecha timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    total numeric(12,2) DEFAULT 0 NOT NULL,
    monto_pagado numeric(12,2) NOT NULL,
    cambio numeric(12,2) DEFAULT 0 NOT NULL,
    metodo_pago character varying(50) NOT NULL,
    usuario_id bigint NOT NULL,
    arqueo_id bigint
);

CREATE SEQUENCE public.venta_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.venta_id_seq OWNED BY public.venta.id;
ALTER TABLE ONLY public.venta ALTER COLUMN id SET DEFAULT nextval('public.venta_id_seq'::regclass);
ALTER TABLE ONLY public.venta ADD CONSTRAINT venta_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.venta ADD CONSTRAINT fk_venta_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuario(id) ON DELETE RESTRICT;
ALTER TABLE ONLY public.venta ADD CONSTRAINT venta_arqueo_id_fkey FOREIGN KEY (arqueo_id) REFERENCES public.arqueo_caja(id);
CREATE INDEX idx_venta_fecha ON public.venta(fecha DESC);
CREATE INDEX idx_venta_arqueo ON public.venta(arqueo_id);

-- ============================================================

CREATE TABLE public.detalle_venta (
    id bigint NOT NULL,
    venta_id bigint NOT NULL,
    producto_id bigint NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(12,2) NOT NULL,
    subtotal numeric(12,2) GENERATED ALWAYS AS (((cantidad)::numeric * precio_unitario)) STORED,
    CONSTRAINT detalle_venta_cantidad_check CHECK ((cantidad > 0))
);

CREATE SEQUENCE public.detalle_venta_id_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.detalle_venta_id_seq OWNED BY public.detalle_venta.id;
ALTER TABLE ONLY public.detalle_venta ALTER COLUMN id SET DEFAULT nextval('public.detalle_venta_id_seq'::regclass);
ALTER TABLE ONLY public.detalle_venta ADD CONSTRAINT detalle_venta_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.detalle_venta ADD CONSTRAINT fk_detalle_venta_cabecera FOREIGN KEY (venta_id) REFERENCES public.venta(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.detalle_venta ADD CONSTRAINT fk_detalle_venta_producto FOREIGN KEY (producto_id) REFERENCES public.producto(id) ON DELETE RESTRICT;
CREATE INDEX idx_detalle_venta_venta ON public.detalle_venta(venta_id);

-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO public.rol (id, nombre) VALUES
(1, 'ADMIN'),
(2, 'EMPLEADO');

SELECT setval('public.rol_id_seq', 2, true);
SELECT setval('public.categoria_id_seq', 1, false);
SELECT setval('public.usuario_id_seq', 1, false);
SELECT setval('public.producto_id_seq', 1, false);
SELECT setval('public.movimiento_inventario_id_seq', 1, false);
SELECT setval('public.arqueo_caja_id_seq', 1, false);
SELECT setval('public.venta_id_seq', 1, false);
SELECT setval('public.detalle_venta_id_seq', 1, false);

-- ============================================================
-- FIN DEL SCRIPT
-- El usuario admin se crea automáticamente por el seed de Spring Boot
-- según las variables APP_SEED_ADMIN_* en el .env
-- ============================================================
