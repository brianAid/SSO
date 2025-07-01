/*
 Navicat Premium Data Transfer

 Source Server         : Postgres
 Source Server Type    : PostgreSQL
 Source Server Version : 170002 (170002)
 Source Host           : localhost:5432
 Source Catalog        : SSO
 Source Schema         : public

 Target Server Type    : PostgreSQL
 Target Server Version : 170002 (170002)
 File Encoding         : 65001

 Date: 01/07/2025 11:34:05
*/


-- ----------------------------
-- Sequence structure for clients_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."clients_id_seq";
CREATE SEQUENCE "public"."clients_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for login_logs_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."login_logs_id_seq";
CREATE SEQUENCE "public"."login_logs_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for refresh_tokens_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."refresh_tokens_id_seq";
CREATE SEQUENCE "public"."refresh_tokens_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for sessions_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."sessions_id_seq";
CREATE SEQUENCE "public"."sessions_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for user_clients_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."user_clients_id_seq";
CREATE SEQUENCE "public"."user_clients_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Sequence structure for users_id_seq
-- ----------------------------
DROP SEQUENCE IF EXISTS "public"."users_id_seq";
CREATE SEQUENCE "public"."users_id_seq" 
INCREMENT 1
MINVALUE  1
MAXVALUE 2147483647
START 1
CACHE 1;

-- ----------------------------
-- Table structure for clients
-- ----------------------------
DROP TABLE IF EXISTS "public"."clients";
CREATE TABLE "public"."clients" (
  "id" int4 NOT NULL DEFAULT nextval('clients_id_seq'::regclass),
  "domain" varchar(255) COLLATE "pg_catalog"."default" NOT NULL,
  "client_id" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "redirect_uri" text COLLATE "pg_catalog"."default" NOT NULL,
  "active" bool DEFAULT true,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "nama" varchar(100) COLLATE "pg_catalog"."default",
  "logo" varchar(200) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of clients
-- ----------------------------
INSERT INTO "public"."clients" VALUES (6, 'localhost:9000', '594485b748c86252', 'localhost:9000/callback', 't', '2025-07-01 07:29:44.862561', 'app3', '/uploads/logo-1751329784853-577889583.png');
INSERT INTO "public"."clients" VALUES (2, 'http://localhost:8001', 'app2', 'http://localhost:8001/callback', 't', '2025-06-29 07:37:39.148221', 'app2', NULL);
INSERT INTO "public"."clients" VALUES (1, 'http://localhost:8000', 'app1', 'http://localhost:8000/callback', 't', '2025-06-29 07:37:39.148221', 'app1', NULL);
INSERT INTO "public"."clients" VALUES (5, '"kasir.laraver"', 'e849d18683305955', '"kasir.laraver/callback"', 't', '2025-06-30 10:44:32.305866', 'kasirApp', NULL);
INSERT INTO "public"."clients" VALUES (4, 'http://localhost:5173', '024e3768bec6aef3', '"kasir.laraver/callback"', 't', '2025-06-29 16:51:14.758221', 'LocalApp', NULL);

-- ----------------------------
-- Table structure for login_logs
-- ----------------------------
DROP TABLE IF EXISTS "public"."login_logs";
CREATE TABLE "public"."login_logs" (
  "id" int4 NOT NULL DEFAULT nextval('login_logs_id_seq'::regclass),
  "user_id" int4 NOT NULL,
  "client_id" varchar COLLATE "pg_catalog"."default" NOT NULL,
  "ip_address" text COLLATE "pg_catalog"."default",
  "user_agent" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of login_logs
-- ----------------------------
INSERT INTO "public"."login_logs" VALUES (8, 1, '1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-06-30 12:47:22.942474');
INSERT INTO "public"."login_logs" VALUES (9, 1, '1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-06-30 13:15:23.460704');
INSERT INTO "public"."login_logs" VALUES (10, 1, '1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-06-30 14:44:49.058266');
INSERT INTO "public"."login_logs" VALUES (11, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-06-30 22:13:42.812013');
INSERT INTO "public"."login_logs" VALUES (12, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-06-30 22:14:12.191377');
INSERT INTO "public"."login_logs" VALUES (13, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-06-30 22:16:24.273471');
INSERT INTO "public"."login_logs" VALUES (14, 1, '1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-01 05:42:32.883498');
INSERT INTO "public"."login_logs" VALUES (15, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 05:46:52.198078');
INSERT INTO "public"."login_logs" VALUES (16, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 06:46:49.126964');
INSERT INTO "public"."login_logs" VALUES (17, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 07:24:24.905121');
INSERT INTO "public"."login_logs" VALUES (18, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 07:39:32.350044');
INSERT INTO "public"."login_logs" VALUES (19, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 07:54:59.945906');
INSERT INTO "public"."login_logs" VALUES (20, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 08:39:33.277627');
INSERT INTO "public"."login_logs" VALUES (21, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 08:55:50.533827');
INSERT INTO "public"."login_logs" VALUES (22, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 09:10:58.540368');
INSERT INTO "public"."login_logs" VALUES (23, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 09:27:10.034581');
INSERT INTO "public"."login_logs" VALUES (24, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 09:42:34.719073');
INSERT INTO "public"."login_logs" VALUES (25, 1, '1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-01 10:06:07.430674');
INSERT INTO "public"."login_logs" VALUES (26, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 10:13:57.933699');
INSERT INTO "public"."login_logs" VALUES (27, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 10:18:26.522967');
INSERT INTO "public"."login_logs" VALUES (28, 1, '1', '::1', 'PostmanRuntime/7.44.1', '2025-07-01 10:18:59.910602');
INSERT INTO "public"."login_logs" VALUES (29, 3, '1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '2025-07-01 10:28:00.383431');

-- ----------------------------
-- Table structure for refresh_tokens
-- ----------------------------
DROP TABLE IF EXISTS "public"."refresh_tokens";
CREATE TABLE "public"."refresh_tokens" (
  "id" int4 NOT NULL DEFAULT nextval('refresh_tokens_id_seq'::regclass),
  "token" text COLLATE "pg_catalog"."default" NOT NULL,
  "user_id" int4 NOT NULL,
  "client_id" int4 NOT NULL,
  "expires_at" timestamp(6) NOT NULL,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP
)
;

-- ----------------------------
-- Records of refresh_tokens
-- ----------------------------
INSERT INTO "public"."refresh_tokens" VALUES (203, 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTkzOSwiZXhwIjoxNzUxOTQ0NzM5fQ.IAq36OVYz3gNsbIEybo11txmZ8sAYsLcEQ9m_uL21MzihKyapFoSYRMy3yvhWcW5tfbCNPvgSmLdZJHaTYMeYryMuzRF54_uPhGVuBWxupeICu_zgI0N-uV5_wf2HevlMr76LqtC1-ZGwafZnkWculgnaoqGdSVZYg6TJr4K8k8B-Nq7Sk2OzuVFBFVeAcuWC-TV3a6qDNeqL0fEy9Y1iBRbUjqAf7pZeHt3WFyM0e3hd-J0AWPJ5vOXVxI4KzQAj-hG3HBbRFnV8o4dlb-UIy8xzgOJxBvJy72YW39WvJ3s0303eyWmir3XB-Sqqc6vyATZ0M0nz_foSjAOQN8Grg', 1, 1, '2025-07-08 10:19:00.001', '2025-07-01 10:19:00.002843');
INSERT INTO "public"."refresh_tokens" VALUES (204, 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6InVzZXIiLCJjbGllbnRfaWQiOiJhcHAxIiwiaWF0IjoxNzUxMzQwNDgwLCJleHAiOjE3NTE5NDUyODB9.GuKU_ZqdCyLWH0fO8BDV6qEGHwne2q7ZPk1Bcd2p0dweglmcpF1r2YsbmG-gUsX_8wZbWPvJZhcOSD04wQUxnt95JnvnfouGMPT1agD3omLdVLf6e-T-xFh7uIZGRE9lFkaxAtiioK6nEUHlIMKZPeO9iMxM6PwjHbBxBJi1o7gtYi-Qug7OgAJrnYQUmVWPhSuNTFdkf4E1uKcPnp3NsTWn9yk7wxjYPLE1PkHp60sMK066SO6mza-Mv4SIkytPvbjh5Odqofts0B-CO_YQP68B0KHe9-fJQz6cRh_QdX2jkbls4gRD47ZXLGtSyqC_NFaDtQnGr-HIIt477ew_Dg', 3, 1, '2025-07-08 10:28:00.459', '2025-07-01 10:28:00.463419');

-- ----------------------------
-- Table structure for sessions
-- ----------------------------
DROP TABLE IF EXISTS "public"."sessions";
CREATE TABLE "public"."sessions" (
  "id" int4 NOT NULL DEFAULT nextval('sessions_id_seq'::regclass),
  "user_id" int4 NOT NULL,
  "client_id" text COLLATE "pg_catalog"."default" NOT NULL,
  "access_token" text COLLATE "pg_catalog"."default" NOT NULL,
  "refresh_token" text COLLATE "pg_catalog"."default",
  "ip_address" text COLLATE "pg_catalog"."default",
  "user_agent" text COLLATE "pg_catalog"."default",
  "created_at" timestamp(6) DEFAULT now(),
  "expires_at" timestamp(6) NOT NULL,
  "revoked_at" timestamp(6)
)
;

-- ----------------------------
-- Records of sessions
-- ----------------------------
INSERT INTO "public"."sessions" VALUES (1, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMyMzQxOCwiZXhwIjoxNzUxMzI0MzE4fQ.VlIXmLxPjEBGHc9YpYDZ8tO7E1pIj7P5yTuOtSEixdDyj4JUybfcg8nEGJm6Ug8162IMnPrzw794ibOmf0ROag6YhY_bIdTNmdWKF-FQNuSR49M_PSxrzY7Zcm4i14bqChuh_jvfdsodZj8gqqSPpw0cA6LZnQ7-CuebaLjQpm0npwOld9ZKp7ZhPg4AO4A3TcEnfTAbAGDVH8kZ9aHlKJ0VFJpWNlKOHeWfywwpDcZIdH1annc9xsdbsJ6rkuoYYyibpab-DlTfLimvjVdsMDVrSh8VVds15YXxt_BilTV8NYfnYX0EMUkQwuAhk-ob0ZaZiDSi8YVzdRGpEgG-_g', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMyMzQxOCwiZXhwIjoxNzUxOTI4MjE4fQ.O-gzAc065n-1_aeb9-NfCXtHcwevwYm2uug0lsFARjfvddONdH139i_3RF3T8VBJJTrogo5P612WyZloSHhFVHg4KMh7TeItNKV5HHatGE-AJUBVrf7lUYC_VcBvo8KRruGkX9W3lttR9toHp2_5a-OlTFLbfEKXgCrG2Lsrb5Tu3DnmvJzwho16A75JRMIeb0KEhw5BVeRaaUlxaXzIkxousoR_XKfOguWymvjzqBZ9cXAeZZwxr-YN3seiFYBT2Ezed9SOEhyaVj2-Utsgf_T_bZfpmRpQ0F8pvEI_KINCXullqxHwvhv2i5ZpUEANNCQvQ-pA5acB1dEjqpZd6w', '::1', 'node-fetch', '2025-07-01 05:43:38.848884', '2025-07-08 05:43:38.834', NULL);
INSERT INTO "public"."sessions" VALUES (2, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMyMzYxMiwiZXhwIjoxNzUxMzI0NTEyfQ.DaHPpBT7QqzhaIMb3fFQCaAiJl6Mu7aFAWDhAnssdjA4pLWufaQvQiGZGh0i5474DsK5XsCQ2hTF7o_t28IXcPL4koMoHQxQJYY8paLgkUTBoMK9LIqexgGWyHY1RNyo5WWYMAx0pbsmT9l4ETzCfuUbiha8k1OrHv8i1jZr1_nlGpqEGL0Bb28sozYOjhOQlM-uoB9WgLImh-DrKA7n8_U1tZBKF90VIFTXPCp3lZUQqKrsTyZldoNU8t98l4XtCwYG8uLpVthDCr1xsVcqKXHl1eeE5ri7AmYh9USf8v2hnZxcQf32cO5FA31Q5CvVLvi-8J30ILnii_4XCQI6gA', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMyMzYxMiwiZXhwIjoxNzUxOTI4NDEyfQ.rAu8T_J7Bns4KRVHw5xFSOchmZhQXrCpe2QSc9ZsbnJh56RUNvLudYZso4794o2C2-0yGHFowDTRYG-NVHF4Q4xgmf3VHmYBtg8YQxGDD45lvaSs1Eeqnss7uRvkaXLAvyv7tC5626UowHSgVjjEm668dSdguyMjJH7Sh3FidOGaJQ1DJjD1yyzHkD3xSu9gBET1YWr-DKyMFMj6nSIE2zlY-MsybYbqwmBYJdSlEB5JItLWm7zuZq7TB6nmYxwf_YuH5GiUJoAWP7oZGe-pWvrKs1WbYjsfD4DChqici9rFFRkAA00rrApTiHUk6WgBCcKK9U3ZWF-3qjGjvd30rg', '::1', 'node-fetch', '2025-07-01 05:46:52.340499', '2025-07-08 05:46:52.327', NULL);
INSERT INTO "public"."sessions" VALUES (3, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMyNzIwOSwiZXhwIjoxNzUxMzI4MTA5fQ.yILBjfHbYO7T6zgpfHsn_4LCWlRRxRQ5KmJgaz2jP0r77U0_62DWzJAr4dqHMD2a-XnVawDqYPacdIlGNDv0laiecZqnBcJ0emamri1bc7_MdeNROBs1U1ygFqt4S-1BEoJ-rmJvPvNS27O8N5ulb37uxOG67kkIq6Cgl_D_lRnQRlT3gcoY2sr_Pn5QfH8SG4eDARuXiNcmkyQtbrXPgIUNGrejzLw5FULrkdqm9oXjpEQKa-aFpFIWfIgCMY6Abz8wHWqAMS1mzqCo5VoZJ1df6quSD6o30NHZoonHnYY14rnv0yB00_0cNyEIkJ7ug7ol2EaqG_puzIUbK5hQ4A', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMyNzIwOSwiZXhwIjoxNzUxOTMyMDA5fQ.QXpSU1E_Tc7NmRYAc5EdGy1Or1UfxQNaV_Q6uFRjMY5zviMnLf0W5sBdDxYknojCm-8nCAKsurjYZ4Uf0SRWQrAh5u3eMI-CaevOkqp0zd3kvueIFTsXhHZmkCgcQ64tZDre00lSJ3SocT4o_RHVZvrlfykkwy7GgSYYKLXXJYJXJxs52MFZ-INqi1ETV6KZ3K02xas0EznZMzgm5KsTeSZzJ_aOHsj1iXMyxqfh5sjrreGeBP5cWbUUvoVGILUUUDxMUg_hwJouWu7TvMQUKJE0RiTOxuthCoFCR8NxfPOyb9ScH3UoOaQXEgiGkriy7wHn38th3ijOOx6icU0c8w', '::1', 'node-fetch', '2025-07-01 06:46:49.307867', '2025-07-08 06:46:49.295', NULL);
INSERT INTO "public"."sessions" VALUES (4, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMyOTQ2NSwiZXhwIjoxNzUxMzMwMzY1fQ.GXDvbeJwL4aOi6XRKIsphBxIKGNuUVw0e0Xt0o4_WbqxR0_QiIy1Hm17uATuKDPG2BSjJIjPaNcSiug0CRcaaiWjax1u0IbrfLUvJ3eyG90ZF6_jMfLjOpLkvd6bqHWxtKvE_Uul7ZCXRMenkceXIQBfqlCV1VcXNQj3VWrOcFnU1RtBznBtzjthF9_Z8NofijZJuypvy48gXJ3a4EctdcY5fukYinf3q0BACMMqLv05WIkqjiIss5huCiffxzDKvYzvq6ASmdLnqRHbIezLNAnrTfd_hK-LFs1BbNaD7QogNx_615xGYN2qtB53nUhMG0VOAPNmFxBZMVUePlvg5g', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMyOTQ2NSwiZXhwIjoxNzUxOTM0MjY1fQ.yo36Y479zpAH1T_cnCc7RgJ58Wofli6fwW8R_tWNSsHdjY_e0qL7Z7ME5v8WKzxwSotIqRIjp-F6YBiK9vTln_fMG3hYf9HcACsYg80uyskMKL9ajepigecZM12oj9F-95JgYgxwxF4Gc3qYCdSJBpXmFZUHhB5vCoZV-6NolFNvX_cRwZxMbqr8kpv2MJQmee8_SVX_hEloVQd8t2anhAu95s_ucZfjOscFbEWHpXYoJAOn_5kuhsqimsG4KPv79ijLASZBQN5OL-e9v_vo3Sg0lS4cWvzg_cNDQyrYR__OjWnOzp8QwfMBgsBASiHz5Spa4uZVqifpX4b5N6Y-kA', '::1', 'node-fetch', '2025-07-01 07:24:25.065073', '2025-07-08 07:24:25.056', NULL);
INSERT INTO "public"."sessions" VALUES (5, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzMDM3MiwiZXhwIjoxNzUxMzMxMjcyfQ.tsB9jb2SKAnsoO9DUmH7NKfpr7_JMRe8KKTgpYvWw69DwMKkGabbESNtZAy-mOSQPZEeMp2v-dzf_J1XnX-w1WETQHI83bBOoYa8yxP0GgBsDksCfprHkfMkYaI3sLeHrPQ3sm1AWelXB5CwygFdPlE9rSZtXr-nyLSxpL6sk0W69cSx3Ln6eO_mz7h-kxaX_4eIwRwXyltHbleL8PwM3EFuMjQeI---Hjn4Z4w5x-spk-OWytJwz5c5a6aSBrLN0ALIO-7DLzgWWRzOhlqEzDUY9ne-i5lvJFYNJKfxMu6iUqh0BJR7HrjFB-peC_AZTkyON2rN5ljytdqzIMvNYg', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzMDM3MiwiZXhwIjoxNzUxOTM1MTcyfQ.Ye2BsIoSuCHSiaqk9Bp83qMj3H3hEAgOrmm0QFYXuJqM1n_aZeKOFBF48cIWCtznxoZaRS8WG61xQTaBVWL_0QUQrJto4zbgEn-d0viQwq9VubvNqVt2jAIwjhgoPgvU31qljxSbemKZtC0qcg7uLVhpvD07hMUMcrz5OdMID17aUi_I_ZMXq9WRpYOa54MOGuFwr-QXXXIl8xd4bFQ92Tv9OI2I_SBo7sN8JRkrX1otTfsp3pp3zrQdFmNdrtgrB4A-s270P-OLnbkLEq6h2CYahOWo4aV4FYh_Yq_yhLdPnd7fmKFARdSrIx0wXdQ1MjUqIZyRryl4j2TTjYwcgA', '::1', 'node-fetch', '2025-07-01 07:39:32.512178', '2025-07-08 07:39:32.502', NULL);
INSERT INTO "public"."sessions" VALUES (6, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzMTMwMCwiZXhwIjoxNzUxMzMyMjAwfQ.maEwGwse6OkAtJ0jGgwzfQTsu0tyOOtrsu9qRMH43NURd21K0TbtoBrI5I_Xmc466R0pBBUJa8dMCDdsYqh2haVUie1MhJDhhMwnOGB5cEN1l8Y3yy7FxXRI0iX6hSBVshIGyj-LCML-yqyqmr6Pf3eDfMwry3nkiBKz7e-V8N5yXN3AGzQdcNwG070d3oPQLNDcX6jvFeZerd7gUs_DcTJyn69HfCSXTD63EMzpJZH9zN_McKKeFANBFK77ioC1V0Z1c-GZ0c2br5eANLaulur1cJgBXyGFdySG4s9sooE6vuEJhiXUxbI1U-HMKoWS6p6x4Ge5YMRKxtyQY58ULA', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzMTMwMCwiZXhwIjoxNzUxOTM2MTAwfQ.zALhzSppWsLd1T0NOniBLCqw5m3QSaK2Z-1kPAyXpbAA2TWBsjOlsHX4Lc86vKQsVpuySSmN9EqS8mQFMykNPmnl9XZF5ylOWcBdT-XAqZjquLjOPls3xUcsqR1-cYDSxyK4PX0sB8q7QZvz8El68UXxs_rxXFmwLZkO1faZUMr90-W4A8jSs32eXCA8mwMfYL5aM2bJMfcZqdsUQsYo5yfiWDxxFx5EmnhB4fb1MhwMGu7MObCS7m3EZgEuA4-B4p90kU-CwXlRmQ8W_mwiqd5iZoAw_S6Bl1ULPOutH7XCnexa9QdeNDs2byu21pKWs1oDVXdEG43SkB7Fks_MYw', '::1', 'node-fetch', '2025-07-01 07:55:00.129727', '2025-07-08 07:55:00.114', NULL);
INSERT INTO "public"."sessions" VALUES (7, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzMzk3MywiZXhwIjoxNzUxMzM0ODczfQ.kNI1B-ugpx9BwX1eXT7039JN8FbyxooF5HQ6DiZRDHuhkd16fu79VXXSLNQzBkRQpDr7djS_FsPYlFRNbxVt9dUBi7kpEdF8fuJ6NbwA5gQcCQEGaZul-KEE7TzjmIWT0dd7DncNnyzq1USfeHSWqEzVQyCob5D_gSkFRr1k6bLZBNLa1OSdQy6TVPA2OT5ygA_s4kgoFTwZpfasY24h0Uc92LGz11b3PcE6xIEjfeOMDtaNzYialtwNyCwQRBsaK01bUjg77mXjj5lbsuvYZ-fxUnxQqTJQ9IfPIX7hbDqhErR8VKvK_UajgC8mWF9PgMPmnoheLUJlJ7gGU6oBtg', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzMzk3MywiZXhwIjoxNzUxOTM4NzczfQ.OxCtloMRkcJqNhQnJ_4wgb2dG933fXVY1AxN878DyRx8XIDyU5vpaCIm9z51Gkcp-rIKU56qO6qxRxLzpO_VNKx9-b--qlTI6fVtSoXrAUS-kdH7FeVEIcmjnG0kiSkdl7WAw-0kU4SdqgIiaBqLWb-51a1AZ4FvC9uCAMvQNhh_W6I1SnTTMcBVP8fsEtCUu_tZo6Gd8ACzFxuOucWlLYGPNIuqz1dgEFxCsGS1AEh74uxIA2SD5yHxw44gAgRkvvKIQ6D2NAmvJMls6CVtAw_4S7diTH0FevOIKCBKNows8fERWAwYrrozIAaWO8yuGjxutOEBukKh5Qxv7PSHPQ', '::1', 'node-fetch', '2025-07-01 08:39:33.588816', '2025-07-08 08:39:33.578', NULL);
INSERT INTO "public"."sessions" VALUES (8, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzNDk1MCwiZXhwIjoxNzUxMzM1ODUwfQ.mrqXsoKJrPp9TVIeSVslhhCUghnIQFrVm3jkMby6gD7SsW_dSRTok-49sy6Ng7uVGkqEGTZBRFOGsIxJn6hRJ7_N85gPAAsEufUnUwanzKQzYwGxy3YLKTwKwpYO6ffB00xDAjhEuFw7C899T0Sc4tVKyE1hotjVGcugQSQM0l5FNkigTo2xPVHvHuDKB-1tc9Zg5lkth6N8o4NtdG2i_cDu4mq7fdPMF_6olPjD1Ug17ZqG6-1WN22k2WhpAoDeheFTsjYyZBXauAAuSGaxebJuPRZCgUfIpkZ_Ju-ATMl5KesSVRC-P9lzNpQIHKAVI47eFG9fsNZC8addlWGT8A', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzNDk1MCwiZXhwIjoxNzUxOTM5NzUwfQ.nuJlPhDM_jzqNmzAqTCUfsN8oSleIP2TNEDlNRWYpvn5Ivot97JcT6jT_pSFGK0JBVbnv2xDFCvfWabPBGtaENSQqHWkmDXbooeCmAHHZ_0aDtVQki0nHXIyFufzBAGCzOhekiFhwixVKYhy1Fuv_0zr3nJvgk1SQJ9eK_STf7AAGI1UNKQ9-NoANFzLtMnKSoMS0MuCeNR08ZsMN2IKY-MhTu3zV8IqZjEhBomkUuhhNg7wyDYKRsTaZbMkzOagulx5XGznbVHt4gpGa1y_chnp6fycVcwTNIOHSX-DpFQw-zLmXpe1ZPB8d9kKL8bCY_CbNPAaKk2xnfLawC6Rmg', '::1', 'node-fetch', '2025-07-01 08:55:50.778631', '2025-07-08 08:55:50.759', NULL);
INSERT INTO "public"."sessions" VALUES (9, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzNTg1OCwiZXhwIjoxNzUxMzM2NzU4fQ.MZEVZF8jzyttCP2YYDldl16sAh7Pqwkc7pzW4nybz2DPqbiwVitGe5RiwDZRC3JQRNJhrTtxwdMvUMjVLY8rLD-hzLpDeZ25zHrL3FbJfXWHmv3QVLpxtxnwOL7sqrBXOMP10AVEYKdgO6qSAz7XR7uuMxCj28vY1Ct0xYtFFTU7ppH7z1kN-3TPvGFO16Or177eYF8nllwYzn1jnSCwbLpO-whhrm16pdk8VBMp6AeZv_9FvsE1D3QeNsAQ5C9nEBGhNbKvHdpWmRhkCLd0ioba5CYkCvyL-suOa6z_4X6RMQGZTD94px3rPobFceC9hYLuYEWN9lOSu2bqWZPyAA', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzNTg1OCwiZXhwIjoxNzUxOTQwNjU4fQ.L2TGXwoJnxxsYoMyEP4dsuthBOVm4KsXZqJaFZiitxT7OgTR8CnazOp_tFNsUwlJ-o6vdKzSHI4Ew4jKUcckmXXAbhHBjdZFTFJl6qm-6at_7KoQhHEBeHUq-jk8-U3rWU30nRvR3t_lfkyJltjYiJUMzMgzQjmlu8H71VBscgFdrLWj_jOO3JDx4BLKgBFPFy1LuLBfFjDzlq7A2RvXdguExlosZr6Hhjy0-th3gVKyj62W2i5WEGos5BlDINOWxnwU99jhksCRHLU_FELQq_Z77L7tkqkyumMRhkBJCt1JO-XLWDNXZ-1EflTzQIlhokYLAuG49Cl43IVZvWpZEw', '::1', 'node-fetch', '2025-07-01 09:10:58.784165', '2025-07-08 09:10:58.772', NULL);
INSERT INTO "public"."sessions" VALUES (10, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzNjgzMCwiZXhwIjoxNzUxMzM3NzMwfQ.kq2X0YaXj-MV_rk8McC6YEOlTcRRh6MqadkK0kPW6qKeY5ydkxifSJ1kUxH6I8sxxKlSfWuWf-EsIWnyCoeXnK-nEnRSHHDeEEjVDXJl1iV4S49-DpAMcSkffXEOnQ3uMddh-sdFxwJFRlmcyR_BygfwVE27qV1QcVJzx1IY2gZpbhRD0NlJH_yApJ494Wq-duGXxAxmj6Rm8PRxjNdgMmtWpousyp8tfsKOG9TFWW2O_NBYyEDB6eKR3BDfTmWHK7m4YAITnvt9f_cpZ1YvmjcZ-8Do9vvu2MRWtNsnZIw7EynBgtU2X9KKuNxpJamKyDhBoyvUtVscuLsZcLSKEg', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzNjgzMCwiZXhwIjoxNzUxOTQxNjMwfQ.peF2fF7hXvqP9gj5KmxKfdoj6pE14wMc_P6_Fkk3B08YoUf3aDkFtZkQPHaW8p_85hrDYCaGSBLPR7eYM1Ra2pH1FSAs_ChJ8CAg6H8fLbunkidN7RNNRZ3H8NkFv5tdYX9VWCy9KuRETWYBiONSb8rBEF6AQ5zcl-ciO9DtttwIFKLyNoYf1xzDKWWA_OPDO0MPNess81w8UixdM3AQqQzksXfG-TE0IJPl4J66tqRLVo1RigvSdj8_vVwe0K5IF_oI7u0cdYSRnsFbWfxq_acdxmEMQvfiglQn9vnP5Va2o33MaN7lAPLWH3tup-RwoWDenyx4rdvh-gp3NHfYOA', '::1', 'node-fetch', '2025-07-01 09:27:10.369818', '2025-07-08 09:27:10.355', NULL);
INSERT INTO "public"."sessions" VALUES (11, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzNzc1NCwiZXhwIjoxNzUxMzM4NjU0fQ.X1Uo08YeDwLoAoYDo8Y0P1D4Iqbrf5PgUDutLaJETnEff-yHWUlGM_O_eR8P1mJc2tWylh1pk_f03MX1xeCuOrNTK_O6a418bUMZwHJ-yS6ZWnr51iNX4YpmsMU2DlN82zrg8JM8woyCrjxCuvtxCYvmxpyXTXL0adZvUb0bnZqqWxMe_U268Mh3wL6nSSMMUl1AI7WsiuxVu2VZ_t18yQ8wQkqEmM5eFYPyeMJcYF-yohqs7SX0BDMZ1C6MTMh8UCCQkyqn3Q8DAKMpOJQFek3ViM60jxTSnYs-6QP21o1QSxfkSi3CQmD0pXFEs1MY4eCw65NGee_ddw-RV9RgvQ', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzNzc1NCwiZXhwIjoxNzUxOTQyNTU0fQ.xfCaYe2wvk1duLYN5Kah-_9z2zkUgpBjRWBiNA_UJ7S0zpxo40pCcpnIAbwMDxd1HifR9mQ7L0735bsH-YSVzUlqhqsXgwDEr1fNXg7JdepH3w8GeZHgCQVLQlszZ7hxnIsxO794m0od2g_iI6qLLzk4aQ9zt2lhP_coSj6zqJsBXg2ljlfvztGv5JWUQWVEyTSdLIZgr9zHSG54Uc2gjBzDZTQ1s8KEGrb1Aj-y-sc19DNAYAiOutijxIaVSezLQtjt6muKuiktKyXp1kfYc1ci8eaernmxkxBri7u7bSk5PRnzNlJ8c3qrp5_iZ_h8e4z-lM30gcTjcRUQmGGgaw', '::1', 'node-fetch', '2025-07-01 09:42:34.93644', '2025-07-08 09:42:34.924', NULL);
INSERT INTO "public"."sessions" VALUES (12, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTE2NywiZXhwIjoxNzUxMzQwMDY3fQ.cA79dygwhp_Z1LCNZ-UFO4sE6VcBiQr1QwfH5OrsOI7RlLmLDdRhrz_OJEJ6NPxdcOe8-2SIWu7M4jJK6_lkSJc2DuxhRVwANtyZKG99kEbbrFfNGZaUIb2lLELcZv4lU4rkFcSgFL8oGrh2waFplLsENUtCjvobaRoJosUXHeBp1iwEqbHyhubEx_RA7VwPQQNg6nWHrPptG3xtB3_aCmOwT-mUgBV_JPLAjCqBJG6ZZmY7nXp4keCNYir0pcKGO-Suu1HoJIcT2YLLN7Yp1UAhCiBkLYtgrKhPosSmYsL_wQJTEa0Ry9lY-taBzdxyTZxzBmBvYM6J_lWCS8XLQQ', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTE2NywiZXhwIjoxNzUxOTQzOTY3fQ.VCBjP3t4wZEu3xfm5IY0EiPzs1QyhmfQdYdFYjcW_tV1yMZmKUMR5V4wdbSLMBLPO3sf8HYPbb43j4h_gDMlvdrZgRPWVDTgnTc0bH34UOUVLAMJBDZA8eXFUUhSxpr-RQUxp1ctwz0QFcPNVXpSWSMMAD_ftehtSLyfp2J0_kakzL1G-sR107rjoo3ctFiT-GxCedDZeWGaGuc3tLIJnObyCzKRe5WTZ_lEb2BYU3rg-hyjRf1sASua9S9FF5CgVsN22xp113sDFicpKHNPVhBTQLneLHv2AOFeN4sVDDxjRsl0t8EvEeseaO8DeSI9dHF7VROxVLlK6qpIzOtnaA', '::1', 'node-fetch', '2025-07-01 10:06:07.835962', '2025-07-08 10:06:07.816', NULL);
INSERT INTO "public"."sessions" VALUES (13, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTYzOCwiZXhwIjoxNzUxMzQwNTM4fQ.l4m9YflhAM9exXVW2oEvSgB7-GMEEc5yMOEnyXiV2ssXkNhmLUTAJxYMrbxXugTMxZ_DFqdzIwSQpRKId9fP8d1BlGryZ_tPL8xIo0IzsnKaURKCWqyiK7_79btfSbDdXOjRH09xa4dz035z77Fqq9ZKK8mjQEf_rrrIHb2bqSgNSaf2Mygc9OVaV56YlviXWv_dzSo2Sf2QcJsI4YoeWYBHzQFq-iupBEj-Ulann1Vxyu3fLXXE0DUXKpP4p8yLumP8tRHCKUjnfjLc6-D4m-1YAPojbsgyVLi_hKCslDRhLcoYmFNB_I75zCU_7viyRtPvLE6a4-aGUIogv7r20w', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTYzOCwiZXhwIjoxNzUxOTQ0NDM4fQ.QFGZiiY8buMvF8KPFnNEkoqzBBf22k3t6mPU7-qe7Wt66tQHYbz851ujyhBDIv6zmLKx-7JCDKTAxcOmB9t5TeuV0xE3GilYUVWz38PmTtM4SkwAFPwTbTnOV9oHZPNkqSV29p8-znWxiK0sVFj_qdae7DATNyMDkXr_9fr7YUIByluSi75X-KjhwRlafTSgVWbu0ojXqUMMNdB07O3N60jUanBwrSDiGCRAG1W-iA3YYd_p6Q_CHvKKRMePvsBQV0uqoKWWBqE-TR9JRaUhCqftmWSIZRvy6k7I90844WqJtNMB5MVlCUr7ef2qa3IMKF_BefH4e263UhIgHTBjGw', '::1', 'node-fetch', '2025-07-01 10:13:58.111334', '2025-07-08 10:13:58.1', NULL);
INSERT INTO "public"."sessions" VALUES (14, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTkwNiwiZXhwIjoxNzUxMzQwODA2fQ.uLwoXtdTIYw71WDaIsUx5K3P0UQnMtO2JHuWclNidZTEoxMxzFUWK0lJHTj7XpH3u7piug3exDIBQlp-SisYvAxbjlVUOMxiFWZTuPbom8D1qmn1BBBw3iGl0JT_ahuLSFf4iHUcamt74F8dGhnaXboOOL8tSCjG35yUAQQ1UnSqCPf-HZg87bkp_yzaAOjSlT4Y0OHRBmQV72wa5igY7zBFbd75_x4Kcyi64h7eRpjubkxRZESzbSqwsixORgu2BepWTElrzDK6iuxmHo9QYZOd66quLjqyxQrWsFEfCQl4lhc4AR-9vM84Z-2VuaRldTvjRTDe1cf08PCeLWWo3g', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTkwNiwiZXhwIjoxNzUxOTQ0NzA2fQ.gu7hgxFrk3F7GXcBVRV99LlsTL3OKtA2KO-OETX8Qf_BB3FQZ23gtlFQMAoKcrG8_Cv3FAdNpjQQ1jA-Pch7S6Xlq6sYaLJsexxNXVC3TaZqWsp4xoPDDLBPV1Qizpngsq1misBxCM6ril0wSHA5ECbbPowrP4KTvKZjXVLpg5T9HPIIevAYzuFB5irqNaCS4udh-xi3AtmQzGV_Q-4aW1fsL2bdxbrPa4G8mYNODfdb16C-qO2jGxYLTOGLmh9-2KJAEzDIODi6In_6ag-xHb1KktcYRQUnjBfT5wCUQk2ieIjHysU2z-rwBmjka7q5NRSVrkMUc1W42GrYceG48Q', '::1', 'node-fetch', '2025-07-01 10:18:26.729443', '2025-07-08 10:18:26.717', NULL);
INSERT INTO "public"."sessions" VALUES (15, 1, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTkzOSwiZXhwIjoxNzUxMzQwODM5fQ.dyfVvpLFIUfqN2LOdiivBPW6wVH23MjSLX8tICr_dMRFAi45lTST0ojc-U0ec3brK8e9MybmtpoMgPJ1iugJGf6TbRxidtVe7MB5yRaRuNSeFjAAJT7BfDhUjKxiqvy8xOl43gmrV2Xz9KTOPyZJ8tU0SUBldiwGPud_1tPi-Am6UlRRMU1hxe2L0SUoPLgUHiJCM-Cp2omIgfomIJQptTTrYhDgZinGhizn3-FXTioAS3a5MwKwtt6jumwMp8ZgR3SsvE-XPSmFaTrI0WL2uxkxegQOj1jZt893cwmLuk6o-Ejgg2zUYnkNNneipUkVdrsGrtnvRcwi_XBNKCa-Cw', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwiY2xpZW50X2lkIjoiYXBwMSIsImlhdCI6MTc1MTMzOTkzOSwiZXhwIjoxNzUxOTQ0NzM5fQ.IAq36OVYz3gNsbIEybo11txmZ8sAYsLcEQ9m_uL21MzihKyapFoSYRMy3yvhWcW5tfbCNPvgSmLdZJHaTYMeYryMuzRF54_uPhGVuBWxupeICu_zgI0N-uV5_wf2HevlMr76LqtC1-ZGwafZnkWculgnaoqGdSVZYg6TJr4K8k8B-Nq7Sk2OzuVFBFVeAcuWC-TV3a6qDNeqL0fEy9Y1iBRbUjqAf7pZeHt3WFyM0e3hd-J0AWPJ5vOXVxI4KzQAj-hG3HBbRFnV8o4dlb-UIy8xzgOJxBvJy72YW39WvJ3s0303eyWmir3XB-Sqqc6vyATZ0M0nz_foSjAOQN8Grg', '::1', 'node-fetch', '2025-07-01 10:19:00.006922', '2025-07-08 10:19:00.001', NULL);
INSERT INTO "public"."sessions" VALUES (16, 3, 'app1', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6InVzZXIiLCJjbGllbnRfaWQiOiJhcHAxIiwiaWF0IjoxNzUxMzQwNDgwLCJleHAiOjE3NTEzNDEzODB9.r_zHNL_O7vgSPdMhK6IFSFaG2_A5RA1q7SihhaOkatkILXM3gLgHuODHNpTbDhAhlHbfHfJ4SCGbWfNt7GXnecEF87xWNPidmfBwOPoXXaIV0FiV1HX4-qmiYvDEL15WYSoBRrOtDQA9GqWbfaSYGhCpnsK2rIGzTmVigCoKUf7IamvIu60FGk_nUwbeb-U8NSgtV3P2jJ7Kdn-L3nDLARDTG59EPIFsMe2bwvOJD1EJXo7HMfhXvSI4_jQUcQNkPyMl5LQf5r43jJT01t1dVa3jPk6jKuZpmqsNH3A1jTZZlqK0oUNWeI-t1jYOccRQUm8wDapZ_KlMBVEJeMC17g', 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6InVzZXIiLCJjbGllbnRfaWQiOiJhcHAxIiwiaWF0IjoxNzUxMzQwNDgwLCJleHAiOjE3NTE5NDUyODB9.GuKU_ZqdCyLWH0fO8BDV6qEGHwne2q7ZPk1Bcd2p0dweglmcpF1r2YsbmG-gUsX_8wZbWPvJZhcOSD04wQUxnt95JnvnfouGMPT1agD3omLdVLf6e-T-xFh7uIZGRE9lFkaxAtiioK6nEUHlIMKZPeO9iMxM6PwjHbBxBJi1o7gtYi-Qug7OgAJrnYQUmVWPhSuNTFdkf4E1uKcPnp3NsTWn9yk7wxjYPLE1PkHp60sMK066SO6mza-Mv4SIkytPvbjh5Odqofts0B-CO_YQP68B0KHe9-fJQz6cRh_QdX2jkbls4gRD47ZXLGtSyqC_NFaDtQnGr-HIIt477ew_Dg', '::1', 'node-fetch', '2025-07-01 10:28:00.475258', '2025-07-08 10:28:00.459', NULL);

-- ----------------------------
-- Table structure for temp_user_excel
-- ----------------------------
DROP TABLE IF EXISTS "public"."temp_user_excel";
CREATE TABLE "public"."temp_user_excel" (
  "id" varchar(50) COLLATE "pg_catalog"."default" NOT NULL,
  "username" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(6) DEFAULT now()
)
;

-- ----------------------------
-- Records of temp_user_excel
-- ----------------------------

-- ----------------------------
-- Table structure for user_clients
-- ----------------------------
DROP TABLE IF EXISTS "public"."user_clients";
CREATE TABLE "public"."user_clients" (
  "id" int4 NOT NULL DEFAULT nextval('user_clients_id_seq'::regclass),
  "user_id" int4 NOT NULL,
  "client_id" int4 NOT NULL,
  "user_id_relasi" varchar(50) COLLATE "pg_catalog"."default"
)
;

-- ----------------------------
-- Records of user_clients
-- ----------------------------
INSERT INTO "public"."user_clients" VALUES (1, 1, 1, NULL);
INSERT INTO "public"."user_clients" VALUES (2, 1, 2, NULL);
INSERT INTO "public"."user_clients" VALUES (3, 2, 1, NULL);
INSERT INTO "public"."user_clients" VALUES (4, 3, 2, NULL);
INSERT INTO "public"."user_clients" VALUES (5, 2, 2, NULL);
INSERT INTO "public"."user_clients" VALUES (6, 3, 1, NULL);
INSERT INTO "public"."user_clients" VALUES (8, 17, 1, NULL);
INSERT INTO "public"."user_clients" VALUES (9, 17, 2, NULL);
INSERT INTO "public"."user_clients" VALUES (11, 3, 4, '5');
INSERT INTO "public"."user_clients" VALUES (12, 14, 4, '1');
INSERT INTO "public"."user_clients" VALUES (13, 15, 4, '2');
INSERT INTO "public"."user_clients" VALUES (14, 16, 4, '4');

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS "public"."users";
CREATE TABLE "public"."users" (
  "id" int4 NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  "username" varchar(100) COLLATE "pg_catalog"."default" NOT NULL,
  "password" text COLLATE "pg_catalog"."default" NOT NULL,
  "created_at" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
  "avatar" varchar(100) COLLATE "pg_catalog"."default",
  "role" varchar(20) COLLATE "pg_catalog"."default" DEFAULT 'user'::character varying
)
;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO "public"."users" VALUES (1, 'admin', '$2b$10$Kd9/V87WtE5dkMmQhZWFxeKp9RHunrVd4Vx1MqKFwY49JTdWTh.qK', '2025-06-29 07:37:33.542437', NULL, 'user');
INSERT INTO "public"."users" VALUES (3, 'user', '$2b$10$Kd9/V87WtE5dkMmQhZWFxeKp9RHunrVd4Vx1MqKFwY49JTdWTh.qK', '2025-06-29 07:37:33.542437', NULL, 'user');
INSERT INTO "public"."users" VALUES (2, 'admin2', '$2b$10$Kd9/V87WtE5dkMmQhZWFxeKp9RHunrVd4Vx1MqKFwY49JTdWTh.qK', '2025-06-29 07:37:33.542437', NULL, 'user');
INSERT INTO "public"."users" VALUES (4, 'username', '$2b$10$SxYfDbQyI/QPSQ07w5ljSOppqHV4xv8pMjfpFr0DLLUu5vOldiCHe', '2025-06-29 16:25:56.285941', NULL, 'user');
INSERT INTO "public"."users" VALUES (6, 'username1', '$2b$10$Hvw8lQCxYLVvJAxmeEGCEOA1I1U30rWYG52CfFND/.FIm4ZtLaciq', '2025-06-29 16:29:48.320202', NULL, 'user');
INSERT INTO "public"."users" VALUES (7, 'username12', '$2b$10$6GxvlQLoBaY2jLEn89EZxuhqgFzlMVH4BColnizfA1qS19CARaA8.', '2025-06-29 16:30:07.495701', NULL, 'user');
INSERT INTO "public"."users" VALUES (8, 'username123', '$2b$10$R00KnUwBaooBg6vJsSZAXOnaaTSIoFDm/z9wEqw3u/gLHsLt/UHbG', '2025-06-29 16:31:30.920686', NULL, 'user');
INSERT INTO "public"."users" VALUES (10, 'username1234', '$2b$10$faGHiZc/8oUdthNaW.fDeuuLeA9OBuIWehtq.amllCt0LCo4jgJo.', '2025-06-29 16:34:01.434533', NULL, 'user');
INSERT INTO "public"."users" VALUES (11, 'brian', '$2b$10$N.tt3e8N1PUUwa3JougJP.kVFr0qW2kEoDPR/uzwZyVj2bLomX9kO', '2025-06-30 10:29:18.901599', NULL, 'user');
INSERT INTO "public"."users" VALUES (13, 'brian1', '$2b$10$gXPrU0APOuVicmAMH8CR4ODflfYW6lRjo6BqqnTQ6.kgND1GaEKHm', '2025-06-30 10:44:39.708251', NULL, 'user');
INSERT INTO "public"."users" VALUES (14, 'brian12', '$2b$10$CTVgxqsmCHusmlCOrHQP1.Pwh6h2h/WI0CPCLJ0aTtWmNs3Rs6Ofy', '2025-06-30 10:45:39.124533', NULL, 'user');
INSERT INTO "public"."users" VALUES (15, 'brian13', '$2b$10$Zft9G.QdeyJ9Kp3LBLeuK.0rhSr2pX9rnV1Q8tGx938CSto6dMESy', '2025-06-30 10:46:48.143698', NULL, 'user');
INSERT INTO "public"."users" VALUES (16, 'brian14', '$2b$10$33si4DbgXU01J.Mn5ohoFuBC0jXCgK56MZRXtpM4ugJrFjz6JykGm', '2025-06-30 10:47:25.082846', NULL, 'user');
INSERT INTO "public"."users" VALUES (17, 'brian19', '$2b$10$iwXhQC4QHPitEMJplv7dAux3E4wD71gxds5wTcJ46i8LWi4u5NWvK', '2025-06-30 10:50:45.846939', NULL, 'user');
INSERT INTO "public"."users" VALUES (18, 'brian900', '$2b$10$hAf0XOOiU4I6uHVDN4Z.g.XbtjZmJ9og1QR3NshodFpEN1T6nior.', '2025-07-01 07:45:44.482105', '/uploads/avatar-1751330744322-928217964.png', 'user');

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."clients_id_seq"
OWNED BY "public"."clients"."id";
SELECT setval('"public"."clients_id_seq"', 6, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."login_logs_id_seq"
OWNED BY "public"."login_logs"."id";
SELECT setval('"public"."login_logs_id_seq"', 29, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."refresh_tokens_id_seq"
OWNED BY "public"."refresh_tokens"."id";
SELECT setval('"public"."refresh_tokens_id_seq"', 204, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."sessions_id_seq"
OWNED BY "public"."sessions"."id";
SELECT setval('"public"."sessions_id_seq"', 16, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."user_clients_id_seq"
OWNED BY "public"."user_clients"."id";
SELECT setval('"public"."user_clients_id_seq"', 14, true);

-- ----------------------------
-- Alter sequences owned by
-- ----------------------------
ALTER SEQUENCE "public"."users_id_seq"
OWNED BY "public"."users"."id";
SELECT setval('"public"."users_id_seq"', 18, true);

-- ----------------------------
-- Uniques structure for table clients
-- ----------------------------
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_client_id_key" UNIQUE ("client_id");

-- ----------------------------
-- Primary Key structure for table clients
-- ----------------------------
ALTER TABLE "public"."clients" ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table login_logs
-- ----------------------------
ALTER TABLE "public"."login_logs" ADD CONSTRAINT "login_logs_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table refresh_tokens
-- ----------------------------
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table sessions
-- ----------------------------
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Primary Key structure for table temp_user_excel
-- ----------------------------
ALTER TABLE "public"."temp_user_excel" ADD CONSTRAINT "temp_user_excel_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table user_clients
-- ----------------------------
ALTER TABLE "public"."user_clients" ADD CONSTRAINT "user_clients_user_id_client_id_key" UNIQUE ("user_id", "client_id");

-- ----------------------------
-- Primary Key structure for table user_clients
-- ----------------------------
ALTER TABLE "public"."user_clients" ADD CONSTRAINT "user_clients_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Uniques structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_username_key" UNIQUE ("username");

-- ----------------------------
-- Primary Key structure for table users
-- ----------------------------
ALTER TABLE "public"."users" ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- ----------------------------
-- Foreign Keys structure for table refresh_tokens
-- ----------------------------
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table sessions
-- ----------------------------
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- ----------------------------
-- Foreign Keys structure for table user_clients
-- ----------------------------
ALTER TABLE "public"."user_clients" ADD CONSTRAINT "user_clients_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "public"."clients" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "public"."user_clients" ADD CONSTRAINT "user_clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION;
